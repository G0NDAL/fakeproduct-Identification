import React, { useEffect, useState } from "react";

const NEWS_API_KEY = "2b89a7b13a924b3abb7ec25e8e3b2616"; // Provided NewsAPI key
const NEWS_API_URL = `https://newsapi.org/v2/everything?q=fake%20product%20OR%20counterfeit%20product%20OR%20scam%20product%20OR%20fraud%20product%20OR%20fake%20goods%20OR%20counterfeit%20goods%20OR%20scam%20goods%20OR%20fraud%20goods%20OR%20fake%20brand%20OR%20counterfeit%20brand%20OR%20scam%20brand%20OR%20fraud%20brand&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`;

const TrendingFakeNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNews = () => {
      setLoading(true);
      fetch(NEWS_API_URL)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data.status !== "ok" || !data.articles || data.articles.length === 0) {
            setError("No news articles found.");
            setArticles([]);
          } else {
            setArticles(data.articles.slice(0, 4));
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setError("Failed to fetch news.");
          setLoading(false);
        });
    };
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 1 minute
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-[#00ffaa] text-center">Trending Fake Product News</h2>
      {loading ? (
        <p className="text-gray-300">Loading news...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        articles.length === 0 ? (
          <p className="text-gray-400">No news articles available.</p>
        ) : (
          <div className="news-cards">
            {articles.map((article, idx) => (
              <div key={idx} className="news-card">
                {article.urlToImage && (
                  <img src={article.urlToImage} alt={article.title} />
                )}
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
                <p>{article.description}</p>
                <div className="news-meta">{new Date(article.publishedAt).toLocaleDateString()} | {article.source.name}</div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
};

export default TrendingFakeNews;
