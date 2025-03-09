import React from 'react';

export interface UserProps {
    name: string;
    age: number;
}

export const User: React.FC<UserProps> = ({ name, age }) => {
    return (
        <div className="user-card">
            <h2>{name}</h2>
            <p>年齢: {age}歳</p>
        </div>
    );
};
