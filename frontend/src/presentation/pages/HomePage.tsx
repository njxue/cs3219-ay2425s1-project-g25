import React, { useState } from "react";
import { useUser } from "domain/contexts/userContext";
import { FindPeerButton } from "presentation/components/buttons/FindPeerButton";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ProfileContainer } from "presentation/components/ProfileContainer";
import { RecentAttemptsTable } from "presentation/components/RecentAttemptsTable";
import { QuestionFilters } from "presentation/components/QuestionFilters";
import { Category } from "domain/entities/Category";
import styles from "./HomePage.module.css";
import { SelectedCategories } from "presentation/components/SelectedCategories";

const HomePage: React.FC = () => {
    const { user } = useUser();

    const [filters, setFilters] = useState({
        selectedDifficulty: "All",
        selectedCategories: [] as Category[],
        searchTerm: ""
    });

    const handleFiltersChange = (newFilters: {
        selectedDifficulty: string;
        selectedCategories: Category[];
        searchTerm: string;
    }) => {
        setFilters(newFilters);
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftContainer}>
                <h1 className={styles.headline}>Find a peer and practice together!</h1>
                <FindPeerButton />
                <div className={styles.selectRow}>
                    <QuestionFilters onFiltersChange={handleFiltersChange} showSearchBar={false} />
                </div>
                <div className={styles.selectRow}>
                    <SelectedCategories categories={filters.selectedCategories} />
                </div>
                <Tooltip
                    className={styles.tooltip}
                    title="You will be matched with a user who has selected the same difficulty level as you"
                >
                    <InfoCircleOutlined style={{ fontSize: "16px", color: "#1890ff", cursor: "pointer" }} />
                </Tooltip>
            </div>
            <div className={styles.rightContainer}>
                <ProfileContainer />
                <RecentAttemptsTable />
            </div>
        </div>
    );
};

export default HomePage;
