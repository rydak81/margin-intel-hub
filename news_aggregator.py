#!/usr/bin/env python3
"""
Margin Intel News Aggregator
Automatically fetch and filter e-commerce news from RSS feeds
"""

import feedparser
import json
from datetime import datetime, timedelta
import re
from typing import List, Dict

# RSS Feed Sources for E-commerce and Marketplace News
RSS_FEEDS = {
    'Amazon Seller Central': [
        'https://sellercentral.amazon.com/newsfeeds/announcements.xml',  # May require auth
        'https://developer.amazonservices.com/rss/newsfeed.xml',
    ],
    'E-commerce News': [
        'https://www.practicalecommerce.com/feed',
        'https://ecommercenews.com/feed/',
        'https://www.digitalcommerce360.com/feed/',
    ],
    'Logistics & Fulfillment': [
        'https://www.supplychainbrain.com/rss',
        'https://www.freightwaves.com/news/feed',
    ],
    'Industry Blogs': [
        'https://feeds.feedburner.com/JungleScout',
        'https://www.sellerapp.com/blog/feed/',
    ]
}

# Keywords to filter for relevance
KEYWORDS = {
    'high_priority': [
        'fees', 'fba', 'fulfillment', 'chargeback', 'reimbursement', 
        'storage', 'inbound placement', 'vendor', 'shortage', 'contra',
        'coop', 'wfs', 'walmart fulfillment', 'profit', 'margin'
    ],
    'medium_priority': [
        'inventory', 'logistics', 'carrier', 'shipping', 'returns',
        'compliance', 'policy', 'terms of service', 'marketplace'
    ],
    'platform_specific': [
        'amazon', 'walmart', 'ebay', 'shopify', 'target'
    ]
}

# Categories for classification
CATEGORIES = {
    'Fees': ['fee', 'cost', 'price', 'charge', 'rate'],
    'Chargebacks': ['chargeback', 'shortage', 'contra', 'coop', 'vendor', 'dispute'],
    'Logistics': ['shipping', 'carrier', 'freight', 'delivery', 'inbound', 'placement'],
    'Policy': ['policy', 'terms', 'compliance', 'regulation', 'update'],
    'Profitability': ['profit', 'margin', 'revenue', 'ebitda', 'cash flow'],
    'Inventory': ['inventory', 'stock', 'restock', 'storage', 'warehouse']
}

def fetch_feeds(feeds: Dict[str, List[str]], days_back: int = 7) -> List[Dict]:
    """
    Fetch RSS feeds and return parsed articles
    
    Args:
        feeds: Dictionary of feed categories and URLs
        days_back: Number of days to look back for articles
    
    Returns:
        List of article dictionaries
    """
    articles = []
    cutoff_date = datetime.now() - timedelta(days=days_back)
    
    for category, urls in feeds.items():
        for url in urls:
            try:
                print(f"Fetching: {url}")
                feed = feedparser.parse(url)
                
                for entry in feed.entries:
                    # Parse date
                    pub_date = entry.get('published_parsed') or entry.get('updated_parsed')
                    if pub_date:
                        article_date = datetime(*pub_date[:6])
                        if article_date < cutoff_date:
                            continue
                    
                    article = {
                        'title': entry.get('title', ''),
                        'link': entry.get('link', ''),
                        'description': entry.get('summary', ''),
                        'published': article_date.isoformat() if pub_date else None,
                        'source_category': category,
                        'source_url': url
                    }
                    articles.append(article)
                    
            except Exception as e:
                print(f"Error fetching {url}: {e}")
                continue
    
    return articles

def score_relevance(article: Dict) -> int:
    """
    Score article relevance based on keywords
    
    Returns:
        Score from 0-10
    """
    text = f"{article['title']} {article['description']}".lower()
    score = 0
    
    # High priority keywords
    for keyword in KEYWORDS['high_priority']:
        if keyword.lower() in text:
            score += 3
    
    # Medium priority keywords
    for keyword in KEYWORDS['medium_priority']:
        if keyword.lower() in text:
            score += 2
    
    # Platform specific
    for keyword in KEYWORDS['platform_specific']:
        if keyword.lower() in text:
            score += 1
    
    return min(score, 10)

def categorize_article(article: Dict) -> str:
    """
    Categorize article based on content
    
    Returns:
        Category name
    """
    text = f"{article['title']} {article['description']}".lower()
    
    # Score each category
    category_scores = {}
    for category, keywords in CATEGORIES.items():
        score = sum(1 for keyword in keywords if keyword in text)
        category_scores[category] = score
    
    # Return highest scoring category
    if max(category_scores.values()) > 0:
        return max(category_scores, key=category_scores.get)
    return 'Other'

def identify_platform(article: Dict) -> str:
    """
    Identify the platform mentioned in the article
    
    Returns:
        Platform name
    """
    text = f"{article['title']} {article['description']}".lower()
    
    platforms = {
        'Amazon': ['amazon', 'fba', 'seller central', 'vendor central'],
        'Walmart': ['walmart', 'wfs'],
        'eBay': ['ebay'],
        'Shopify': ['shopify'],
        'Target': ['target plus'],
    }
    
    for platform, keywords in platforms.items():
        if any(keyword in text for keyword in keywords):
            return platform
    
    return 'General'

def generate_summary_bullets(article: Dict) -> List[str]:
    """
    Generate 3 summary bullet points from article
    
    Returns:
        List of 3 bullet points
    """
    # This is a simplified version - in production you'd use NLP or AI
    description = article['description']
    
    # Split into sentences
    sentences = re.split(r'[.!?]+', description)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    # Take first 3 meaningful sentences
    bullets = sentences[:3] if len(sentences) >= 3 else sentences
    
    # Ensure we have exactly 3 bullets
    while len(bullets) < 3:
        bullets.append('')
    
    return bullets[:3]

def process_articles(articles: List[Dict], min_score: int = 3) -> List[Dict]:
    """
    Process and filter articles
    
    Args:
        articles: Raw articles from RSS feeds
        min_score: Minimum relevance score to include
    
    Returns:
        Processed and filtered articles
    """
    processed = []
    
    for article in articles:
        # Score relevance
        score = score_relevance(article)
        if score < min_score:
            continue
        
        # Categorize and identify platform
        category = categorize_article(article)
        platform = identify_platform(article)
        
        # Generate summary
        summary = generate_summary_bullets(article)
        
        # Create processed article
        processed_article = {
            'date': article.get('published', datetime.now().isoformat())[:10],
            'platform': platform,
            'category': category,
            'headline': article['title'],
            'sourceLink': article['link'],
            'summary': summary,
            'soWhat': '',  # To be filled manually
            'postAngle': '',  # To be filled manually
            'toolMapping': suggest_tool_mapping(category),
            'status': 'Saved',
            'postTemplate': suggest_post_template(category),
            'relevance_score': score,
            'raw_description': article['description']
        }
        
        processed.append(processed_article)
    
    # Sort by relevance score
    processed.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    return processed

def suggest_tool_mapping(category: str) -> str:
    """
    Suggest ThreeColts product based on category
    
    Returns:
        Product name
    """
    mapping = {
        'Fees': 'MarginPro',
        'Chargebacks': 'MarginPro',
        'Profitability': 'MarginPro',
        'Logistics': 'Multichannel Pro',
        'Inventory': 'Multichannel Pro',
        'Policy': 'Seller365'
    }
    
    return mapping.get(category, 'MarginPro')

def suggest_post_template(category: str) -> str:
    """
    Suggest post template based on category
    
    Returns:
        Template key
    """
    if category in ['Fees', 'Chargebacks', 'Policy']:
        return 'news-action'
    elif category in ['Profitability']:
        return 'pain-story'
    else:
        return 'operator-take'

def save_to_json(articles: List[Dict], filename: str = 'margin_intel_articles.json'):
    """
    Save processed articles to JSON file
    """
    with open(filename, 'w') as f:
        json.dump(articles, f, indent=2)
    print(f"Saved {len(articles)} articles to {filename}")

def main():
    """
    Main execution function
    """
    print("=" * 60)
    print("Margin Intel News Aggregator")
    print("=" * 60)
    print()
    
    # Fetch feeds
    print("Fetching RSS feeds...")
    raw_articles = fetch_feeds(RSS_FEEDS, days_back=7)
    print(f"Found {len(raw_articles)} total articles")
    print()
    
    # Process and filter
    print("Processing articles...")
    processed_articles = process_articles(raw_articles, min_score=3)
    print(f"Filtered to {len(processed_articles)} relevant articles")
    print()
    
    # Display top articles
    print("Top 10 Most Relevant Articles:")
    print("-" * 60)
    for i, article in enumerate(processed_articles[:10], 1):
        print(f"{i}. [{article['relevance_score']}/10] {article['headline'][:70]}")
        print(f"   {article['platform']} | {article['category']} | {article['toolMapping']}")
        print()
    
    # Save to JSON
    save_to_json(processed_articles)
    
    print()
    print("Next steps:")
    print("1. Review articles in margin_intel_articles.json")
    print("2. Add 'soWhat' and 'postAngle' to top articles")
    print("3. Import into Margin Intel Hub app")
    print("4. Generate LinkedIn posts")

if __name__ == '__main__':
    # Install required packages first:
    # pip install feedparser
    
    main()
