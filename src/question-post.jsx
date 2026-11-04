function QuestionPost({formData, handleChange}) {
    return (
        <div>
            <div className="post-content">
                This section is designed based on the type of the post. It could be devoloped by conditional rendering.
                <span> For post a question, the following section would be appeared.</span>
            </div>
            <div className="question-title">
                <span>Title</span>
                <input type="text" name="title" className="question-input" placeholder = "Start your question with how, what, why, etc." value={formData.title} onChange={handleChange} maxLength={150} required></input>
            </div>
            <div className="question-problem">
                <p>Describe your problem</p>
                <textarea name="content" className="problem-input" placeholder="Describe your question in detail" value={formData.content} onChange={handleChange} maxLength={4000} required></textarea>
            </div>
            <div className="tags-title">
                <span>Tags</span>
                <input type="text" name="tags" className="tags-input" placeholder="Please add up to 3 tags to describe what your question is " value={formData.tags} onChange={handleChange}></input>
            </div>
       
        </div>
    );
}

export default QuestionPost;