import React from "react";
import { Input } from "antd";

interface SearchBarProps {
	searchTerm: string;
	onSearch: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
	searchTerm,
	onSearch,
}) => {
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onSearch(e.target.value);
	};

	return (
		<Input
			placeholder="Search questions..."
			value={searchTerm}
			onChange={handleInputChange}
			allowClear
		/>
	);
};
