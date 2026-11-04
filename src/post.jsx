import { useState } from "react";
import QuestionPost from "./question-post.jsx";
import ArticlePost from "./article-post.jsx";
import Header from "./header.jsx";

function Post() {
    const [postType, setPostType] = useState("Question");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        abstract: "",
        content: "",
        tags: "",
        plan: "Free"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check login
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please log in before submitting a post.");
            return;
        }

        // Validate title
        if (!formData.title.trim()) {
            alert("Please enter a title.");
            return;
        }

        if (formData.title.trim().length < 6) {
            alert("Title must contain at least 6 characters.");
            return;
        }

        // Validate article fields
        if (postType === "Article") {
            if (!formData.abstract.trim()) {
                alert("Please enter an abstract.");
                return;
            }

            if (!formData.content.trim()) {
                alert("Please enter your article content.");
                return;
            }
        }

        // Validate question content
        if (postType === "Question" && !formData.content.trim()) {
            alert("Please describe your question.");
            return;
        }

        // Validate tags
        const tags = formData.tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean);

        if (tags.length > 3) {
            alert("You can add a maximum of 3 tags.");
            return;
        }

        if (tags.some((tag) => tag.length < 2 || tag.length > 20)) {
            alert("Each tag must contain between 2 and 20 characters.");
            return;
        }
        const postData = {
            type: postType,
            title: formData.title.trim(),
            abstract: formData.abstract.trim(),
            content: formData.content.trim(),
            tags: tags,
            plan: formData.plan
        };

        try {
            setLoading(true);
            const API_URL = "http://localhost:3000";
            console.log("Token:", token);
            console.log("Post Data:", postData);
            console.log("API URL:", API_URL); 
            const response = await fetch(`${API_URL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });
            console.log("Response Status:", response.status);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to submit post.");
            }

            alert("Your post has been published successfully!");

            // Clear form after successful submission
            setFormData({
                title: "",
                abstract: "",
                content: "",
                tags: "",
                plan: "Free"
            });

        } catch (error) {
            console.error("Post submission error:", error);
            alert(error.message || "An error occurred while submitting your post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />

            <form className="post-container" onSubmit={handleSubmit}>

                <div className="new-post">
                    <p>New Post</p>
                </div>

                <div className="post-type">
                    <p>Select Post Type:</p>

                    <label>
                        <input
                            type="radio"
                            className="post-radio"
                            value="Question"
                            checked={postType === "Question"}
                            onChange={(e) => setPostType(e.target.value)}
                        />
                        Question
                    </label>

                    <label>
                        <input
                            type="radio"
                            className="post-radio"
                            value="Article"
                            checked={postType === "Article"}
                            onChange={(e) => setPostType(e.target.value)}
                        />
                        Article
                    </label>
                </div>

                <div className="post-info">
                    What do you want to ask or share?
                </div>

                <div className="post-section">

                    {postType === "Question" ? (
                        <QuestionPost
                            formData={formData}
                            handleChange={handleChange}
                        />
                    ) : (
                        <ArticlePost
                            formData={formData}
                            handleChange={handleChange}
                        />
                    )}

                </div>

                <div className="post-plan">
                    <p>Who can access your post?</p>

                    <select
                        name="plan"
                        value={formData.plan}
                        onChange={handleChange}
                    >
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>

                <button
                    className="new-post-button"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Publishing..." : "Post"}
                </button>

            </form>
        </>
    );
}

export default Post;