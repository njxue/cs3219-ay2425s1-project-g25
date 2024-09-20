import React from "react";
import { Card, Tag, Divider, Button } from "antd";
import { Question } from "../../domain/entities/Question";
import { getDifficultyColor, getStatusColor } from "../utils/QuestionUtils";
import styles from "./QuestionDetail.module.css";

interface QuestionDetailProps {
	question: Question;
	onStartQuestion: () => void;
	isWorking: boolean;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({
	question,
	onStartQuestion,
	isWorking,
}) => (
	<div className={`${styles.cardWrapper} ${isWorking ? styles.working : ""}`}>
		<Card className={styles.card}>
			<div className={styles.header}>
				<div className={styles.titleContainer}>
					<h2 className={styles.title}>{question.title}</h2>
					{isWorking && (
						<Tag
							color={getStatusColor(question.status)}
							className={styles.statusTag}
						>
							{question.status}
						</Tag>
					)}
				</div>
				{!isWorking && (
					<Tag
						color={getStatusColor(question.status)}
						className={styles.statusTag}
					>
						{question.status}
					</Tag>
				)}
			</div>
			<Divider className={styles.divider} />
			<div className={styles.content}>
				<p className={styles.description}>{question.description}</p>
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
				{!isWorking && (
					<Button
						type="primary"
						onClick={onStartQuestion}
						className={styles.startButton}
					>
						Start Question
					</Button>
				)}
			</div>
		</Card>
	</div>
);
