import React, { useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface SearchBarProps {
	onSearch: (searchTerm: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearch = () => {
		onSearch(searchTerm);
	};

	return (
		<Input
			placeholder="Search questions"
			value={searchTerm}
			onChange={(e) => setSearchTerm(e.target.value)}
			onPressEnter={handleSearch}
			style={{ width: "100%", marginBottom: "16px" }}
			suffix={
				<SearchOutlined onClick={handleSearch} style={{ cursor: "pointer" }} />
			}
		/>
	);
};
