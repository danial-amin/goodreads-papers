# PaperReads - Goodreads for Papers Roadmap

## 🎯 Vision
Create a **social reading platform for research papers** - like Goodreads, but for academic papers. Focus on community, discovery, and sharing your reading journey.

---

## 📚 What Makes Goodreads Great (Applied to Papers)

### Core Goodreads Features:
1. **Social Reading** - See what friends are reading
2. **Reviews & Ratings** - Share your thoughts on papers
3. **Reading Lists** - Organize papers like bookshelves
4. **Reading Challenges** - Set and track reading goals
5. **Community** - Discussions, groups, recommendations
6. **Discovery** - Find papers based on what you like
7. **Public Profiles** - Showcase your reading journey

---

## 🚀 Strategic Feature Roadmap

### Phase 1: Social Foundation (High Priority)

#### 1.1 **Reading Lists (Collections)**
**Why:** Like Goodreads bookshelves - organize papers you want to read, are reading, or have read.

**Features:**
- **Default Lists**: "Want to Read", "Currently Reading", "Read", "Favorites"
- **Custom Lists**: Create your own lists (e.g., "Transformer Papers", "My PhD Reading List")
- **Public/Private Lists**: Share lists with others or keep them private
- **List Descriptions**: Add descriptions to your lists
- **Drag-and-Drop**: Easy organization

**Implementation:**
- `Collection` model (rename to `ReadingList`)
- Many-to-many: Papers ↔ Reading Lists
- Public/private settings
- List sharing

**Impact:** High - Core Goodreads feature

---

#### 1.2 **Reviews & Ratings**
**Why:** Central to Goodreads - users share their thoughts on what they've read.

**Features:**
- **Star Ratings**: 1-5 star ratings
- **Written Reviews**: Full review text (Markdown support)
- **Review Visibility**: Public or private reviews
- **Review Likes**: Like helpful reviews
- **Review Sorting**: Sort by helpful, recent, highest rated
- **Review Templates**: Optional templates for structured reviews

**Implementation:**
- Enhance existing `UserPaperInteraction.rating` and `notes`
- Add `review_text` field
- Review display on paper detail pages
- Review feed/page

**Impact:** Very High - Core social feature

---

#### 1.3 **User Profiles & Following**
**Why:** See what others are reading, build your network.

**Features:**
- **Public Profiles**: Showcase reading stats, reviews, lists
- **Follow Users**: Follow researchers you're interested in
- **Followers/Following**: See who follows you
- **Reading Stats**: Papers read, reviews written, lists created
- **Reading Goals**: Display current reading goals
- **Recent Activity**: Show recent reviews, lists, reading activity

**Implementation:**
- User profile pages
- Follow system (`UserFollow` model)
- Activity feed
- Profile customization

**Impact:** Very High - Core social feature

---

### Phase 2: Community & Discovery (High Priority)

#### 2.1 **Activity Feed**
**Why:** See what your network is reading and reviewing.

**Features:**
- **Friend Activity**: See reviews, ratings, and lists from people you follow
- **Recent Reviews**: Latest reviews on papers
- **Popular Papers**: Trending papers in your network
- **Activity Types**: Reviews, ratings, list additions, reading status changes
- **Filtering**: Filter by activity type, user, paper

**Implementation:**
- Activity tracking system
- Feed generation
- Real-time updates (optional)

**Impact:** High - Keeps users engaged

---

#### 2.2 **Paper Discussions**
**Why:** Discuss papers with the community.

**Features:**
- **Paper Discussion Threads**: Discussion per paper
- **Comments**: Comment on reviews and discussions
- **Threaded Replies**: Nested comment threads
- **Upvoting**: Upvote helpful comments
- **Discussion Topics**: Organize by topics (methodology, results, etc.)

**Implementation:**
- `Discussion` and `Comment` models
- Discussion UI on paper pages
- Comment threading

**Impact:** High - Builds community

---

#### 2.3 **Reading Groups**
**Why:** Like Goodreads groups - read papers together.

**Features:**
- **Create Groups**: Create reading groups around topics
- **Group Reading Lists**: Shared reading lists for groups
- **Group Discussions**: Discussions within groups
- **Reading Schedules**: Set reading schedules for groups
- **Group Recommendations**: Get recommendations based on group activity

**Implementation:**
- `ReadingGroup` model
- Group management UI
- Group activity feed

**Impact:** Medium-High - Builds engaged communities

---

### Phase 3: Enhanced Discovery (Medium Priority)

#### 3.1 **Social Recommendations**
**Why:** Discover papers based on what your network likes.

**Features:**
- **Friend Recommendations**: Papers your friends rated highly
- **Similar Readers**: Find users with similar reading tastes
- **Network Trends**: Trending papers in your network
- **Friend Activity**: Papers your friends are reading
- **Community Picks**: Popular papers in the community

**Implementation:**
- Social recommendation algorithm
- Similarity calculation between users
- Trending algorithm

**Impact:** High - Better discovery

---

#### 3.2 **Reading Challenges & Goals**
**Why:** Like Goodreads reading challenges - gamify reading.

**Features:**
- **Annual Reading Challenge**: Set papers to read this year
- **Monthly Goals**: Monthly reading goals
- **Reading Streaks**: Track consecutive reading days/weeks
- **Achievements**: Badges for milestones
- **Progress Tracking**: Visual progress indicators
- **Challenge Sharing**: Share your challenge progress

**Implementation:**
- Challenge tracking system
- Achievement system
- Progress visualization

**Impact:** Medium-High - Increases engagement

---

#### 3.3 **Enhanced Search & Discovery**
**Why:** Make it easy to find papers.

**Features:**
- **Advanced Search**: Search by title, author, tags, reviews
- **Filter by Ratings**: Filter by average rating
- **Filter by Reviews**: Papers with most reviews
- **Trending Papers**: Currently popular papers
- **New Releases**: Recently added papers
- **Similar Papers**: "Readers who liked this also liked..."

**Implementation:**
- Enhanced search functionality
- Trending algorithm
- Similarity recommendations

**Impact:** High - Core discovery feature

---

### Phase 4: Polish & Engagement (Lower Priority)

#### 4.1 **Reading Stats & Insights**
**Why:** Show users their reading journey.

**Features:**
- **Reading Stats Dashboard**: Papers read, reviews written, lists created
- **Reading Timeline**: Visualize reading over time
- **Genre/Domain Breakdown**: See what domains you read most
- **Reading Velocity**: Papers per week/month
- **Favorite Authors**: Most read authors
- **Favorite Venues**: Most read conferences/journals

**Implementation:**
- Analytics service
- Dashboard visualization
- Stats calculation

**Impact:** Medium - Nice to have

---

#### 4.2 **Export & Sharing**
**Why:** Share your reading with others.

**Features:**
- **Export Reading List**: Export lists as BibTeX, CSV
- **Share Lists**: Share lists via link
- **Reading Report**: Generate reading report PDF
- **Social Sharing**: Share reviews/lists on social media
- **Embed Widgets**: Embed reading stats on websites

**Implementation:**
- Export functionality
- Sharing system
- Report generation

**Impact:** Medium - Useful for researchers

---

## 🎯 Quick Wins (Implement First)

### Week 1: Social Foundation
1. **Reading Lists** (3 days)
   - Default lists + custom lists
   - Public/private settings
   - High immediate value

2. **Reviews & Ratings** (3 days)
   - Star ratings + written reviews
   - Review display
   - Core Goodreads feature

### Week 2: Community
3. **User Profiles & Following** (4 days)
   - Public profiles
   - Follow system
   - Activity feed

4. **Paper Discussions** (3 days)
   - Discussion threads
   - Comments
   - Community building

### Week 3: Discovery
5. **Social Recommendations** (4 days)
   - Friend recommendations
   - Similar readers
   - Network trends

6. **Reading Challenges** (3 days)
   - Annual challenge
   - Progress tracking
   - Gamification

---

## 📊 Feature Priority Matrix

| Feature | Goodreads Alignment | User Value | Effort | Priority |
|---------|-------------------|-----------|--------|----------|
| Reading Lists | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium | P0 |
| Reviews & Ratings | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium | P0 |
| User Profiles | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium | P0 |
| Following System | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | P0 |
| Activity Feed | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | P1 |
| Discussions | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | P1 |
| Social Recommendations | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | P1 |
| Reading Challenges | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Low | P1 |
| Reading Groups | ⭐⭐⭐⭐ | ⭐⭐⭐ | Medium | P2 |
| Reading Stats | ⭐⭐⭐ | ⭐⭐⭐ | Low | P2 |

---

## 🗄️ Database Schema Changes

### New Models

```python
# ReadingList (Collection) model
class ReadingList(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # Want to Read, Currently Reading, etc.
    created_at = Column(DateTime)
    papers = relationship("Paper", secondary="reading_list_papers")

# UserFollow model
class UserFollow(Base):
    id = Column(Integer, primary_key=True)
    follower_id = Column(Integer, ForeignKey("users.id"))
    following_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime)

# Discussion model
class Discussion(Base):
    id = Column(Integer, primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(Text)
    created_at = Column(DateTime)
    comments = relationship("Comment", back_populates="discussion")

# Comment model
class Comment(Base):
    id = Column(Integer, primary_key=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    parent_comment_id = Column(Integer, ForeignKey("comments.id"))  # For threading
    created_at = Column(DateTime)
    discussion = relationship("Discussion", back_populates="comments")

# ReadingChallenge model
class ReadingChallenge(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    year = Column(Integer)
    target_papers = Column(Integer)
    current_count = Column(Integer, default=0)
    created_at = Column(DateTime)

# ReadingGroup model
class ReadingGroup(Base):
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime)
    members = relationship("User", secondary="group_members")
```

### Enhanced Models

```python
# Enhance UserPaperInteraction
class UserPaperInteraction(Base):
    # ... existing fields ...
    review_text = Column(Text)  # Full written review
    review_public = Column(Boolean, default=True)  # Public or private review
    review_likes = Column(Integer, default=0)  # Number of likes on review
    # ... rest of fields ...
```

---

## 🎨 UI/UX Considerations

### Goodreads-Inspired Design
- **Paper Cards**: Show rating, review snippet, reading status
- **Profile Pages**: Reading stats, recent activity, lists
- **Review Pages**: Full reviews with likes and comments
- **List Pages**: Grid/list view of papers in a list
- **Activity Feed**: Timeline of friend activity
- **Search**: Prominent search bar with filters

### Key Pages Needed
1. **Home Feed**: Activity from your network
2. **Paper Detail**: Paper info + reviews + discussions
3. **User Profile**: User's reading journey
4. **Reading Lists**: Browse and manage lists
5. **Reviews**: Browse all reviews
6. **Discussions**: Browse discussions
7. **Search**: Advanced search and discovery

---

## ✅ Success Criteria

### Phase 1 (Social Foundation)
- [ ] Users can create and share reading lists
- [ ] Users can write and view reviews
- [ ] Users can follow other users
- [ ] Public profiles are functional
- [ ] Activity feed shows friend activity

### Phase 2 (Community)
- [ ] Discussions work on paper pages
- [ ] Comments and replies work
- [ ] Reading groups can be created
- [ ] Social recommendations are accurate

### Phase 3 (Discovery)
- [ ] Reading challenges work
- [ ] Enhanced search is functional
- [ ] Trending papers are shown
- [ ] Similar papers are recommended

---

## 🚀 Implementation Order

1. **Reading Lists** (Week 1, Days 1-3)
2. **Reviews & Ratings** (Week 1, Days 4-6)
3. **User Profiles & Following** (Week 2, Days 7-10)
4. **Activity Feed** (Week 2, Days 11-13)
5. **Discussions** (Week 3, Days 14-16)
6. **Social Recommendations** (Week 3, Days 17-20)
7. **Reading Challenges** (Week 4, Days 21-23)

**Total: ~23 days (4-5 weeks)**

---

## 📝 Key Differences from Academic Tools

| Feature | Academic Tools (Zotero, Mendeley) | Goodreads for Papers |
|---------|----------------------------------|---------------------|
| Focus | Research management | Social reading |
| Primary Use | Organize citations | Share reading journey |
| Key Features | Citations, PDFs, notes | Reviews, lists, social |
| Users | Researchers | Anyone interested in papers |
| Discovery | Search & filters | Social recommendations |
| Organization | Folders, tags | Reading lists, shelves |

---

## 🎓 Vision

**PaperReads = Goodreads for Research Papers**

- Social platform for paper readers
- Community-driven discovery
- Share your reading journey
- Connect with other researchers
- Simple, engaging, fun

**Not:**
- Citation manager
- Research database
- Academic tool
- Complex system

**Is:**
- Social reading platform
- Community hub
- Discovery engine
- Reading tracker
