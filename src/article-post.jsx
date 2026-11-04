function ArticlePost({formData, handleChange}) {
    return (
        <div>
            <div className="post-content">
                This section is designed based on the type of the post. It could be devoloped by conditional rendering.
                <span>For posting an article, complete the following fields.</span>
            </div>

            <div className="article-title">
                <p>Title</p>

                <input
                    type="text" name="title" className="article-input" placeholder="Enter a descriptive title" value={formData.title} onChange={handleChange} maxLength={150} required />
            </div>

            <div>
                <p>Abstract</p>

                <textarea
                    name="abstract" className="abstract-input" placeholder="Enter a short summary of your article" value={formData.abstract} onChange={handleChange} maxLength={1000} required />
            </div>

            <div>
                <p>Article Text</p>
                <textarea name="content" className="abstract-input" placeholder="Write your complete article here..." value={formData.content} onChange={handleChange} maxLength={10000} required />
            </div>

            <div className="tags-title">
                <span>Tags</span>

                <input type="text" name="tags" className="tags-input" placeholder="Add up to 3 tags separated by commas" value={formData.tags} onChange={handleChange} />
            </div>

        </div>
    );
}

export default ArticlePost;