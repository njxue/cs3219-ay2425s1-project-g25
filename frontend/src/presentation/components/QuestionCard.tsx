import React from "react";
import { Card, Tag, Divider } from "antd";
import { Question } from "../../domain/entities/question";
import styles from "./QuestionCard.module.css";
import { getDifficultyColor } from "presentation/utils/questionUtils";

interface QuestionCardProps {
	question: Question;
	isSelected: boolean;
	onClick: () => void;
	isNarrow: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
	question,
	isSelected,
	onClick,
	isNarrow,
}) => (
	<Card
		className={`${styles.card} ${isSelected ? styles.selectedCard : ""} ${
			isNarrow ? styles.narrowCard : ""
		}`}
		hoverable
		onClick={onClick}
	>
		<div className={styles.header}>
			<h2 className={styles.title}>{question.title}</h2>
		</div>
		<p className={styles.description}>{question.description}</p>
		<Divider className={styles.divider} />
		<div className={styles.footer}>
			<Tag
				color={getDifficultyColor(question.difficulty)}
				className={styles.difficultyTag}
			>
				{question.difficulty}
			</Tag>
			<div className={styles.categoriesContainer}>
				{question.categories.map((category, idx) => (
					<Tag key={idx} color="blue" className={styles.categoryTag}>
						{category}
					</Tag>
				))}
			</div>
		</div>
	</Card>
);
