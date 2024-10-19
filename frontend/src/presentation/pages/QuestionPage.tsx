import React, { useState } from "react";

const QuestionPage: React.FC = () => {
    const [answer, setAnswer] = useState<string>("");
    const [submitted, setSubmitted] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnswer(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div>
            <h1>Question Page</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    What is the capital of France?
                    <input type="text" value={answer} onChange={handleInputChange} />
                </label>
                <button type="submit">Submit</button>
            </form>
            {submitted && <p>Your answer: {answer}</p>}
        </div>
    );
};

export default QuestionPage;
