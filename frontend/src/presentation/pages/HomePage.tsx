import { useUser } from "domain/contexts/userContext";
import React from "react"

const HomePage: React.FC = () => {
    const { user } = useUser();

    return (
        <div>
            <p>{user? user.username : 'Hello'} </p>
        </div>
    )
}

export default HomePage;