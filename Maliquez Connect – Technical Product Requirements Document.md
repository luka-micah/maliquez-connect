# **Maliquez Connect – Technical Product Requirements Document (TPRD)** 

## **AI Development Context for MERN Stack Implementation** 

**Version:** 1.0 **Date:** June 2026 **Project:** Maliquez Connect **Tagline:** Discover. Compare. Decide. 

## **1. Project Overview** 

## **Vision** 

Maliquez Connect is a multi-sector discovery and decision intelligence platform that helps individuals, families, and businesses make informed decisions by providing detailed information, comparisons, reviews, and recommendations across essential services. 

The platform focuses on: 

- Education 

- Healthcare 

- Hospitality 

- Logistics 

- Additional sectors in future versions. 

Unlike traditional directories, the platform explains: 

- What options are available? 

- Which option is best? 

- Why is it recommended? 

- How does it compare with alternatives? 

## **2. Primary Goal of MVP** 

The primary goal of the MVP is: 

Build a powerful search and discovery platform that allows users to easily find, compare, and evaluate service providers across multiple sectors. 

1 

## **3. User Roles** 

## **3.1 Guest User** 

Can: 

- Browse listings 

- Search listings 

- Filter listings 

- View details 

- Compare listings 

- Register an account 

Cannot: 

- Leave reviews 

- Add listings 

- Save favorites 

## **3.2 Registered User** 

Can: 

- Everything Guest can do 

- Leave reviews 

- Rate listings 

- Save favorites 

- Receive recommendations 

- Compare services 

- Manage profile 

## **3.3 Service Provider** 

Can: 

- Create listings 

- Edit listings 

- Upload images 

- Manage listings 

- View listing analytics 

- Respond to reviews 

2 

## **3.4 Administrator** 

Can: 

- Manage all users 

- Approve listings 

- Suspend listings 

- Create categories 

- Moderate reviews 

- Manage recommendations 

- View platform analytics 

- Manage providers 

## **4. Technology Stack** 

## **Frontend** 

- React.js • React Router • Redux Toolkit • React Query • Tailwind CSS • Axios • React Hook Form • Zod 

## **Backend** 

- Node.js • Express.js • MongoDB • Mongoose • JWT Authentication • Redis 

- Cloudinary 

## **Search Engine** 

Recommended: 

- Meilisearch 

3 

Alternative: 

- Elasticsearch 

## **Deployment** 

Frontend: 

- Vercel 

Backend: 

- Render 

- Database: 

   - MongoDB Atlas 

Storage: 

- Cloudinary • Redis Cloud 

Caching: 

## **5. System Architecture** 

```
Frontend (React)
        ↓
API Gateway (Express)
        ↓
Authentication Service
Listing Service
Search Service
Review Service
Recommendation Service
Notification Service
        ↓
MongoDB
        ↓
Redis Cache
        ↓
Meilisearch
```

4 

## **6. Core Modules** 

## **Module 1: Authentication** 

Features: 

- Register 

- Login • Email Verification 

- Forgot Password 

- Reset Password 

- JWT Authentication 

- Refresh Tokens 

- Role-Based Access Control 

## **Module 2: Categories** 

Examples: 

- Education • Healthcare 

- Hospitality • Logistics 

Features: 

- Create category • Update category • Delete category 

- View categories 

## **Module 3: Listings** 

The most important entity in the system. 

Listings represent: 

- Schools • Hospitals • Hotels 

- Logistics Companies 

- Future sectors 

5 

Features: 

- Create Listing 

- Update Listing 

- Delete Listing 

- View Listing 

- Approve Listing 

- Search Listing 

## **Module 4: Search and Discovery (Highest Priority)** 

Features: 

## **Search by:** 

- Keyword 

- Category 

- State 

- City 

- Rating 

- Features 

- Pricing 

- Sector 

## **Advanced Features** 

- Auto Suggestions 

- Fuzzy Search 

- Search Ranking 

- Popular Searches 

- Recent Searches 

- Trending Listings 

## **Module 5: Comparison Engine** 

Users can compare: 

- Schools 

- Hospitals 

- Hotels 

- Logistics Companies 

6 

Comparison Parameters: 

- Price 

- Ratings 

- Location 

- Facilities 

- Reviews 

- Features 

- Verification Status 

## **Module 6: Reviews and Ratings** 

Features: 

- Star ratings 

- Written reviews 

- Like helpful review 

- Report review 

- Provider responses 

## **Module 7: Recommendation Engine** 

## **MVP** 

Rule-Based Recommendation System 

Example: 

IF: 

- Budget = Low • Rating > 4 

- State = Lagos 

THEN: 

Recommend matching listings. 

## **Future** 

- Machine Learning 

- AI Ranking 

- Personalized Recommendations 

7 

## **Module 8: Provider Dashboard** 

Features: 

- Create listings 

- Edit listings 

- Upload photos 

- Manage profile 

- View analytics 

- Respond to reviews 

## **Module 9: Admin Dashboard** 

Features: 

- User management 

- Category management 

- Listing approvals 

- Review moderation 

- Platform analytics 

- Provider management 

## **7. Database Design** 

## **USERS COLLECTION** 

```
{
```

```
_id,
firstName,
lastName,
email,
phone,
password,
avatar,
role,
isVerified,
status,
providerProfile,
createdAt,
```

8 

```
updatedAt
}
```

Role: 

```
USER
PROVIDER
ADMIN
```

## **PROVIDER PROFILE** 

```
{
businessName,
businessType,
website,
description,
address,
state,
city,
logo,
verificationStatus
}
```

## **CATEGORIES** 

```
{
_id,
name,
slug,
description,
icon,
status,
createdAt
}
```

9 

## **LISTINGS** 

```
{
_id,
title,
slug,
description,
category,
owner,
sector,
contact,
location,
images,
features,
pricing,
operatingHours,
averageRating,
reviewCount,
verified,
status,
createdAt,
updatedAt
}
```

## **LOCATION** 

```
{
address,
state,
city,
country,
latitude,
longitude
}
```

## **CONTACT** 

```
{
phone,
```

10 

```
email,
website,
whatsapp
}
```

## **PRICING** 

```
{
minimum,
maximum,
currency
}
```

## **REVIEWS** 

```
{
_id,
user,
listing,
rating,
review,
helpfulCount,
status,
createdAt
}
```

## **FAVORITES** 

```
{
user,
listing,
createdAt
}
```

11 

## **COMPARISONS** 

```
{
```

```
user,
listings,
createdAt
}
```

## **RECOMMENDATIONS** 

```
{
user,
listing,
reason,
score,
createdAt
}
```

## **SEARCH HISTORY** 

```
{
user,
keyword,
filters,
createdAt
}
```

## **NOTIFICATIONS** 

```
{
```

```
user,
title,
message,
read,
```

12 

```
createdAt
}
```

## **8. API Structure** 

Base URL: 

```
/api/v1
```

## **AUTH APIs** 

```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/profile
PUT  /auth/profile
```

## **CATEGORY APIs** 

```
GET /categories
GET /categories/:id
POST /categories
PUT /categories/:id
DELETE /categories/:id
```

## **LISTING APIs** 

```
GET /listings
GET /listings/:id
POST /listings
```

13 

```
PUT /listings/:id
DELETE /listings/:id
```

## **SEARCH APIs** 

```
GET /search
GET /search/suggestions
GET /search/trending
GET /search/recent
```

Example: 

```
/search?q=school&state=plateau
```

## **REVIEW APIs** 

```
POST /reviews
PUT /reviews/:id
DELETE /reviews/:id
GET /reviews/listing/:id
```

## **FAVORITES APIs** 

```
POST /favorites
DELETE /favorites/:id
GET /favorites
```

14 

## **COMPARISON APIs** 

```
POST /comparisons
GET /comparisons/:id
DELETE /comparisons/:id
```

## **RECOMMENDATION APIs** 

```
GET /recommendations
```

## **ADMIN APIs** 

```
GET /admin/users
GET /admin/providers
GET /admin/listings
PUT /admin/listings/:id/approve
PUT /admin/users/:id/status
```

## **9. Search Architecture** 

## **Meilisearch Index** 

```
{
title,
description,
category,
state,
city,
features,
rating
}
```

15 

## **Search Features** 

- Full-text search • Typo tolerance • Auto-complete • Filters • Ranking rules • Synonyms 

Example: 

```
hosptal
```

returns: 

```
hospital
```

## **10. Permissions Matrix** 

|Action|User|Provider|Admin|
|---|---|---|---|
|Search Listings|Yes|Yes|Yes|
|Add Listing|No|Yes|Yes|
|Edit Own Listing|No|Yes|Yes|
|Approve Listings|No|No|Yes|
|Leave Reviews|Yes|Yes|Yes|
|Suspend Users|No|No|Yes|



## **11. Frontend Pages** 

## **Public** 

- Home • Search 

- Listing Details 

- Compare 

- Categories 

16 

- Login • Register 

## **User Dashboard** 

- Profile • Favorites 

- Reviews 

- Recommendations 

## **Provider Dashboard** 

- Dashboard • Listings • Analytics • Reviews • Settings 

## **Admin Dashboard** 

- Dashboard • Users • Providers • Listings • Categories • Reviews • Reports 

## **12. Frontend Folder Structure** 

```
src
├── api
├── assets
├── components
├── hooks
├── layouts
├── pages
├── routes
├── services
├── store
├── utils
├── context
```

17 

```
├── types
└── App.jsx
```

## **13. Backend Folder Structure** 

```
src
├── config
├── controllers
├── middlewares
├── models
├── routes
├── services
├── repositories
├── validators
├── jobs
├── utils
├── constants
├── app.js
└── server.js
```

## **14. Development Roadmap** 

## **Sprint 1** 

- Authentication 

- User Management • Categories 

- Listings CRUD 

## **Sprint 2** 

- Search Engine 

- Discovery 

- Filters • Listing Details 

18 

## **Sprint 3** 

- Reviews 

- Ratings 

- Favorites 

- Comparison Engine 

## **Sprint 4** 

- Recommendation Engine 

- Provider Dashboard 

## **Sprint 5** 

- Admin Dashboard 

- Analytics 

- Notifications 

## **15. MVP Definition** 

The MVP is complete when users can: 

1. Register and login 

2. Search across sectors 

3. Discover listings 

4. View listing details 

5. Compare services 

6. Leave reviews 

7. Providers can manage listings 

8. Admins can manage the platform 

## **Future Features** 

- AI-powered recommendations 

- Subscription plans 

- Paid promotions 

- Booking engine 

- Messaging system 

- Mobile applications 

- Multi-language support 

19 

- AI decision assistant 

- Real-time chat support 

## **Success Metrics** 

- Number of listings 

- Search volume 

- Search-to-view conversion 

- Reviews submitted 

- Monthly active users 

- Provider retention 

- Recommendation engagement 

## **Product Philosophy** 

Discover. Compare. Understand. Decide. 

Maliquez Connect is not a directory platform. 

It is a Decision Intelligence Platform that helps users confidently choose the right service provider through information, comparison, and trusted recommendations. 

20 

