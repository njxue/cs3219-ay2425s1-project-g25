import styles from './HomePage.module.css';
import { useUser } from "domain/contexts/userContext";
import React from "react";
import { FindPeerButton } from 'presentation/components/buttons/FindPeerButton';
import { Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { CategoriesDropdown } from 'presentation/components/CategoriesDropdown';
import { DifficultiesDropdown } from 'presentation/components/DifficultiesDropdown';
import { ProfileContainer } from 'presentation/components/ProfileContainer';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { RecentAttemptsTable } from 'presentation/components/RecentAttemptsTable';

const HomePage: React.FC = () => {
    const { user } = useUser();

    return (
        <div className={styles.container}>
            <div className={styles.leftContainer}>
                <h1 className={styles.headline}>Find a peer and practice together!</h1>
                <FindPeerButton />
                <div className={styles.selectRow}>
                    <CategoriesDropdown />
                    <DifficultiesDropdown />
                </div>
                <Tooltip className={styles.tooltip} title="You will be matched with a user who has selected the same difficulty level as you">
                    <InfoCircleOutlined style={{ fontSize: '16px', color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
            </div>
            <div className={styles.rightContainer}>
                <ProfileContainer />
                <RecentAttemptsTable />
            </div>
        </div>
    )
}

export default HomePage;