"""
Reading pattern tracking and analytics
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, List
from datetime import datetime, timedelta
from models import User, UserPaperInteraction, Paper, InteractionStatus
from collections import defaultdict, Counter

class ReadingPatternAnalyzer:
    """Analyze user reading patterns"""
    
    @staticmethod
    def get_reading_stats(user_id: int, db: Session) -> Dict:
        """Get comprehensive reading statistics"""
        interactions = db.query(UserPaperInteraction).filter(
            UserPaperInteraction.user_id == user_id
        ).all()
        
        if not interactions:
            return {
                "total_papers": 0,
                "by_status": {},
                "by_rating": {},
                "reading_velocity": 0,
                "favorite_domains": [],
                "favorite_venues": [],
                "reading_timeline": [],
                "top_keywords": []
            }
        
        # Get papers for these interactions
        paper_ids = [i.paper_id for i in interactions]
        papers = db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
        paper_map = {p.id: p for p in papers}
        
        # Status breakdown
        by_status = Counter(i.status.value for i in interactions)
        
        # Rating breakdown
        by_rating = Counter(i.rating for i in interactions if i.rating)
        
        # Reading velocity (papers per month)
        if interactions:
            first_interaction = min(i.created_at for i in interactions)
            days_since = (datetime.now() - first_interaction.replace(tzinfo=None)).days
            months = max(days_since / 30, 0.1)  # Avoid division by zero
            reading_velocity = len(interactions) / months
        else:
            reading_velocity = 0
        
        # Favorite domains
        domain_counter = Counter()
        for interaction in interactions:
            paper = paper_map.get(interaction.paper_id)
            if paper and paper.domains:
                for domain in paper.domains.split(','):
                    domain_counter[domain.strip()] += 1
        
        favorite_domains = [domain for domain, count in domain_counter.most_common(5)]
        
        # Favorite venues
        venue_counter = Counter()
        for interaction in interactions:
            paper = paper_map.get(interaction.paper_id)
            if paper and paper.venue:
                venue_counter[paper.venue] += 1
        
        favorite_venues = [venue for venue, count in venue_counter.most_common(5)]
        
        # Reading timeline (last 6 months)
        timeline = defaultdict(int)
        six_months_ago = datetime.now() - timedelta(days=180)
        
        for interaction in interactions:
            if interaction.created_at and interaction.created_at.replace(tzinfo=None) >= six_months_ago:
                month_key = interaction.created_at.strftime("%Y-%m")
                timeline[month_key] += 1
        
        reading_timeline = [{"month": k, "count": v} for k, v in sorted(timeline.items())]
        
        # Top keywords from read papers
        keyword_counter = Counter()
        read_papers = [i for i in interactions if i.status == InteractionStatus.READ]
        for interaction in read_papers:
            paper = paper_map.get(interaction.paper_id)
            if paper:
                if paper.keywords:
                    for keyword in paper.keywords.split(','):
                        keyword_counter[keyword.strip()] += 1
                if paper.smart_tags:
                    for tag in paper.smart_tags.split(','):
                        keyword_counter[tag.strip()] += 1
        
        top_keywords = [kw for kw, count in keyword_counter.most_common(10)]
        
        return {
            "total_papers": len(interactions),
            "by_status": dict(by_status),
            "by_rating": {str(k): v for k, v in dict(by_rating).items()},
            "reading_velocity": round(reading_velocity, 2),
            "favorite_domains": favorite_domains,
            "favorite_venues": favorite_venues,
            "reading_timeline": reading_timeline,
            "top_keywords": top_keywords,
            "read_count": by_status.get("read", 0),
            "favorite_count": by_status.get("favorite", 0),
            "want_to_read_count": by_status.get("want_to_read", 0)
        }
    
    @staticmethod
    def get_reading_insights(user_id: int, db: Session) -> List[str]:
        """Generate reading pattern insights"""
        stats = ReadingPatternAnalyzer.get_reading_stats(user_id, db)
        insights = []
        
        if stats["total_papers"] == 0:
            return ["Start reading papers to see your patterns!"]
        
        # Velocity insights
        if stats["reading_velocity"] > 10:
            insights.append(f"📚 You're reading {stats['reading_velocity']:.1f} papers per month - very active!")
        elif stats["reading_velocity"] > 5:
            insights.append(f"📖 You're reading {stats['reading_velocity']:.1f} papers per month - good pace!")
        else:
            insights.append(f"📝 You're reading {stats['reading_velocity']:.1f} papers per month - keep it up!")
        
        # Domain insights
        if stats["favorite_domains"]:
            insights.append(f"🎯 Your main interests: {', '.join(stats['favorite_domains'][:3])}")
        
        # Completion insights
        read_ratio = stats["read_count"] / stats["total_papers"] if stats["total_papers"] > 0 else 0
        if read_ratio > 0.7:
            insights.append("✅ You complete most papers you start - great focus!")
        elif read_ratio > 0.4:
            insights.append("📊 You're making good progress on your reading list")
        
        # Favorite insights
        if stats["favorite_count"] > 0:
            insights.append(f"⭐ You've favorited {stats['favorite_count']} papers - these are your top picks!")
        
        return insights
