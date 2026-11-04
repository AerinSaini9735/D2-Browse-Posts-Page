import { useEffect, useState } from "react";
import Header from "./header.jsx";

function BrowsePosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hiddenPosts, setHiddenPosts] = useState([]);
    const [expandedPosts, setExpandedPosts] = useState([]);

    // Filter states
    const [dateFilter, setDateFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [planFilter, setPlanFilter] = useState("All");
    const [tagFilter, setTagFilter] = useState("");

    const API_URL = "http://localhost:3000";

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(API_URL + "/posts", {
                headers: token ? {
                    Authorization: "Bearer " + token
                } : {}
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setPosts(result.posts);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Apply filters
    const filteredPosts = posts.filter((post) => {
        const postDate = post.createdAt?._seconds
            ? new Date(post.createdAt._seconds * 1000)
            : new Date(post.createdAt);

        const matchesDate = !dateFilter ||
            postDate.toISOString().slice(0, 10) === dateFilter;

        const matchesType = typeFilter === "All" ||
            post.type === typeFilter;

        const matchesPlan = planFilter === "All" ||
            post.plan === planFilter;

        const matchesTag = !tagFilter ||
            post.tags?.some((tag) =>
                tag.toLowerCase().includes(tagFilter.toLowerCase())
            );

        return matchesDate && matchesType && matchesPlan && matchesTag;
    });

    // Reset all filters
    const resetFilters = () => {
        setDateFilter("");
        setTypeFilter("All");
        setPlanFilter("All");
        setTagFilter("");
    };

    // Hide a post
    const hidePost = (postId) => {
        setHiddenPosts([...hiddenPosts, postId]);
    };

    // Restore all hidden posts
    const restorePosts = () => {
        setHiddenPosts([]);
    };

    const toggleExpand = (postId) => {
        if (expandedPosts.includes(postId)) {
            setExpandedPosts(expandedPosts.filter(id => id !== postId));
        } else {
            setExpandedPosts([...expandedPosts, postId]);
        }
    };
    return (
        <>
            <Header />

            <div className="browse-container">
                <h1>Browse Posts</h1>
                <p>Explore questions and articles from our community.</p>

                {/* Filters */}
                <div className="filters">
                    <label>
                        Filter by date:
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </label>

                    <label>
                        Filter by type:
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Question">Question</option>
                            <option value="Article">Article</option>
                        </select>
                    </label>

                    <label>
                        Filter by plan:
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                        >
                            <option value="All">All Plans</option>
                            <option value="Free">Free</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </label>

                    <label>
                        Filter by tag:
                        <input
                            type="text"
                            placeholder="Enter a tag..."
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                        />
                    </label>

                    <button onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>

                {loading && <p>Loading posts...</p>}

                {error && <p>{error}</p>}

                {!loading && !error && filteredPosts.length === 0 && (
                    <p>No matching posts found.</p>
                )}

                {hiddenPosts.length > 0 && (
                    <button onClick={restorePosts}>
                        Restore Hidden Posts ({hiddenPosts.length})
                    </button>
                )}

                <div className="posts-list">
                    {filteredPosts
                        .filter((post) => !hiddenPosts.includes(post.id))
                        .map((post) => (
                            <div className="post-card" key={post.id}>

                                <span className="post-label">
                                    {post.type}
                                </span>

                                <span className="post-label">
                                    {post.plan}
                                </span>

                                <h2>{post.title}</h2>

                                {post.type === "Article" && (
                                    <p>{post.abstract}</p>
                                )}

                                <p>
                                    {expandedPosts.includes(post.id)
                                        ? post.content
                                        : post.content.substring(0, 150) + "..."}
                                </p>

                                <button onClick={() => toggleExpand(post.id)}>
                                    {expandedPosts.includes(post.id)
                                        ? "Show Less"
                                        : "Read More"}
                                </button>

                                <div className="post-tags">
                                    {post.tags?.map((tag, index) => (
                                        <span key={index}>#{tag} </span>
                                    ))}
                                </div>

                                <small>
                                    Author: {post.userId}
                                </small>

                                <br />

                                <small>
                                    {postDateDisplay(post.createdAt)}
                                </small>

                                <br />

                                <button onClick={() => hidePost(post.id)}>
                                    Hide Post
                                </button>

                            </div>
                        ))}
                </div>
            </div>
        </>
    );

}

// Format post date
function postDateDisplay(createdAt) {
    if (!createdAt) return "";

    const date = createdAt._seconds
        ? new Date(createdAt._seconds * 1000)
        : new Date(createdAt);

    return date.toLocaleDateString();

}

export default BrowsePosts;
