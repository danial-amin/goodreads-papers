"""
Reading Habits Tracker

Tracks streaks, weekly goals, and reading velocity.
Designed to help PhD students and researchers build consistent reading habits.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import math

from models import User, Paper, UserPaperInteraction, InteractionStatus


class ReadingHabitsTracker:
    """Tracks and analyzes reading habits"""

    # Statuses that count as "read" for habit tracking
    READ_STATUSES = [
        InteractionStatus.READ,
        InteractionStatus.STUDIED,
        InteractionStatus.IMPLEMENTED,
        InteractionStatus.CITED,
    ]

    # All engagement statuses (including skimmed)
    ENGAGED_STATUSES = [
        InteractionStatus.SKIMMED,
        InteractionStatus.READING,
        InteractionStatus.READ,
        InteractionStatus.STUDIED,
        InteractionStatus.IMPLEMENTED,
        InteractionStatus.CITED,
    ]

    @classmethod
    def get_iso_week(cls, dt: datetime) -> str:
        """Get ISO week string (e.g., '2024-W01')"""
        return dt.strftime("%G-W%V")

    @classmethod
    def get_week_start(cls, dt: datetime) -> datetime:
        """Get the start of the week (Monday)"""
        return dt - timedelta(days=dt.weekday())

    @classmethod
    def update_user_streak(cls, user_id: int, db: Session) -> Dict:
        """
        Update user's streak based on their reading activity.
        Should be called when user marks a paper as read.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}

        current_week = cls.get_iso_week(datetime.utcnow())

        # Check if user read any papers this week
        week_start = cls.get_week_start(datetime.utcnow())
        papers_this_week = (
            db.query(UserPaperInteraction)
            .filter(
                UserPaperInteraction.user_id == user_id,
                UserPaperInteraction.status.in_(cls.READ_STATUSES),
                UserPaperInteraction.updated_at >= week_start,
            )
            .count()
        )

        if papers_this_week > 0:
            if user.last_reading_week == current_week:
                # Already counted this week
                pass
            elif user.last_reading_week:
                # Check if it's consecutive
                last_week_dt = datetime.strptime(user.last_reading_week + "-1", "%G-W%V-%w")
                expected_next = cls.get_iso_week(last_week_dt + timedelta(weeks=1))

                if current_week == expected_next:
                    # Consecutive week!
                    user.current_streak += 1
                else:
                    # Streak broken, start new
                    user.current_streak = 1
            else:
                # First week ever
                user.current_streak = 1

            user.last_reading_week = current_week
            user.longest_streak = max(user.longest_streak or 0, user.current_streak or 0)

        db.commit()

        return {
            "current_streak": user.current_streak,
            "longest_streak": user.longest_streak,
            "last_reading_week": user.last_reading_week,
        }

    @classmethod
    def get_reading_habits(cls, user_id: int, db: Session) -> Dict:
        """
        Get comprehensive reading habits data for the dashboard.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return cls._empty_habits()

        # Update streak first
        cls.update_user_streak(user_id, db)
        db.refresh(user)

        now = datetime.utcnow()
        week_start = cls.get_week_start(now)
        month_ago = now - timedelta(days=30)
        week_ago = now - timedelta(days=7)

        # Get all interactions
        all_interactions = (
            db.query(UserPaperInteraction)
            .filter(UserPaperInteraction.user_id == user_id)
            .all()
        )

        # Papers this week
        papers_this_week = len([
            i for i in all_interactions
            if i.status in cls.ENGAGED_STATUSES
            and i.updated_at
            and i.updated_at >= week_start
        ])

        # Papers last 7 days
        papers_7_days = len([
            i for i in all_interactions
            if i.status in cls.ENGAGED_STATUSES
            and i.updated_at
            and i.updated_at >= week_ago
        ])

        # Papers last 30 days
        papers_30_days = len([
            i for i in all_interactions
            if i.status in cls.ENGAGED_STATUSES
            and i.updated_at
            and i.updated_at >= month_ago
        ])

        # Understanding breakdown
        understanding_breakdown = Counter()
        for interaction in all_interactions:
            if interaction.status:
                understanding_breakdown[interaction.status.value] += 1

        # Calculate weekly history (last 12 weeks)
        weekly_history = cls._calculate_weekly_history(all_interactions, weeks=12)

        # Average papers per week
        total_weeks = len(weekly_history) or 1
        total_engaged = sum(w["count"] for w in weekly_history)
        avg_per_week = total_engaged / total_weeks if total_weeks > 0 else 0

        # Determine streak status
        weekly_goal = user.weekly_paper_goal or 3
        week_progress = (papers_this_week / weekly_goal) * 100 if weekly_goal > 0 else 0

        if week_progress >= 100:
            streak_status = "on_track"
        elif week_progress >= 50:
            streak_status = "at_risk"
        else:
            streak_status = "needs_attention"

        # Generate insights
        insights = cls._generate_habit_insights(
            current_streak=user.current_streak or 0,
            weekly_goal=weekly_goal,
            papers_this_week=papers_this_week,
            avg_per_week=avg_per_week,
            understanding_breakdown=understanding_breakdown,
        )

        return {
            "current_streak": user.current_streak or 0,
            "longest_streak": user.longest_streak or 0,
            "streak_status": streak_status,
            "weekly_goal": weekly_goal,
            "papers_this_week": papers_this_week,
            "week_progress_percent": min(week_progress, 100),
            "understanding_breakdown": dict(understanding_breakdown),
            "papers_last_7_days": papers_7_days,
            "papers_last_30_days": papers_30_days,
            "avg_papers_per_week": round(avg_per_week, 1),
            "weekly_history": weekly_history,
            "habit_insights": insights,
        }

    @classmethod
    def _calculate_weekly_history(
        cls, interactions: List[UserPaperInteraction], weeks: int = 12
    ) -> List[Dict]:
        """Calculate papers read per week for the last N weeks"""
        now = datetime.utcnow()
        history = []

        for i in range(weeks - 1, -1, -1):
            week_start = cls.get_week_start(now - timedelta(weeks=i))
            week_end = week_start + timedelta(days=7)
            week_label = cls.get_iso_week(week_start)

            count = len([
                interaction for interaction in interactions
                if interaction.status in cls.ENGAGED_STATUSES
                and interaction.updated_at
                and week_start <= interaction.updated_at < week_end
            ])

            history.append({
                "week": week_label,
                "count": count,
                "start_date": week_start.strftime("%Y-%m-%d"),
            })

        return history

    @classmethod
    def _generate_habit_insights(
        cls,
        current_streak: int,
        weekly_goal: int,
        papers_this_week: int,
        avg_per_week: float,
        understanding_breakdown: Counter,
    ) -> List[str]:
        """Generate personalized habit insights"""
        insights = []

        # Streak insights
        if current_streak >= 4:
            insights.append(f"Excellent! You've maintained a {current_streak}-week reading streak!")
        elif current_streak >= 2:
            insights.append(f"Good progress! {current_streak} weeks and counting.")
        elif current_streak == 1:
            insights.append("You're on a roll! Keep reading to build your streak.")
        else:
            insights.append("Start your streak by reading a paper this week!")

        # Weekly progress
        if papers_this_week >= weekly_goal:
            insights.append(f"You've hit your weekly goal of {weekly_goal} papers!")
        elif papers_this_week > 0:
            remaining = weekly_goal - papers_this_week
            insights.append(f"{remaining} more paper{'s' if remaining > 1 else ''} to reach your weekly goal.")

        # Understanding depth
        deep_reads = sum(
            understanding_breakdown.get(s.value, 0)
            for s in [InteractionStatus.STUDIED, InteractionStatus.IMPLEMENTED, InteractionStatus.CITED]
        )
        total_reads = sum(understanding_breakdown.values())

        if total_reads > 0:
            depth_ratio = deep_reads / total_reads
            if depth_ratio > 0.3:
                insights.append("Great depth! You're studying papers thoroughly, not just skimming.")
            elif depth_ratio < 0.1 and total_reads > 5:
                insights.append("Consider studying some papers more deeply for better retention.")

        # Velocity insight
        if avg_per_week > 5:
            insights.append(f"High velocity reader! Averaging {avg_per_week:.1f} papers/week.")
        elif avg_per_week < 1 and total_reads > 0:
            insights.append("Try setting a smaller weekly goal to build consistency.")

        return insights[:4]  # Max 4 insights

    @classmethod
    def _empty_habits(cls) -> Dict:
        """Return empty habits for new users"""
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "streak_status": "needs_attention",
            "weekly_goal": 3,
            "papers_this_week": 0,
            "week_progress_percent": 0,
            "understanding_breakdown": {},
            "papers_last_7_days": 0,
            "papers_last_30_days": 0,
            "avg_papers_per_week": 0,
            "weekly_history": [],
            "habit_insights": ["Add your first paper to start tracking your reading habits!"],
        }

    @classmethod
    def update_weekly_goal(cls, user_id: int, new_goal: int, db: Session) -> Dict:
        """Update user's weekly paper goal"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}

        user.weekly_paper_goal = max(1, min(new_goal, 20))  # Clamp between 1-20
        db.commit()

        return {"weekly_goal": user.weekly_paper_goal}
