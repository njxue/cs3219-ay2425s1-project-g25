import React from "react";
import { Card, Tag, Divider } from "antd";
import { Question } from "../../domain/entities/question";
import { getDifficultyColor } from "../utils/questionUtils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import styles from "./QuestionDetail.module.css";

interface QuestionDetailProps {
	question: Question;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
	const match = /language-(\w+)/.exec(className || "");
	return !inline && match ? (
		<SyntaxHighlighter
			style={tomorrow}
			language={match[1]}
			PreTag="div"
			className={styles.codeBlock}
			{...props}
		>
			{String(children).replace(/\n$/, "")}
		</SyntaxHighlighter>
	) : (
		<code className={className} {...props}>
			{children}
		</code>
	);
};

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ question }) => (
	<div className={styles.cardWrapper}>
		<Card className={styles.card}>
			<div className={styles.header}>
				<div className={styles.titleContainer}>
					<h2 className={styles.title}>{question.title}</h2>
				</div>
			</div>
			<Divider className={styles.divider} />
			<div className={styles.content}>
				<ReactMarkdown
					className={styles.description}
					components={{ code: CodeBlock }}
				>
					{question.description}
				</ReactMarkdown>
				<div className={styles.metaContainer}>
					<div className={styles.difficultyContainer}>
						<span className={styles.metaLabel}>Difficulty:</span>
						<Tag
							color={getDifficultyColor(question.difficulty)}
							className={styles.difficultyTag}
						>
							{question.difficulty}
						</Tag>
					</div>
					<div className={styles.categoriesContainer}>
						<span className={styles.metaLabel}>Categories:</span>
						{question.categories.map((category, idx) => (
							<Tag key={idx} color="blue" className={styles.categoryTag}>
								{category}
							</Tag>
						))}
					</div>
				</div>
			</div>
		</Card>
	</div>
);
