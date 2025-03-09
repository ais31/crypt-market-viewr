import React from 'react';
import { render, screen } from '@testing-library/react';
import { User, UserProps } from '../UserComponent';

describe('Userコンポーネント', () => {
    const defaultProps: UserProps = {
        name: "山田太郎",
        age: 30
    };

    test('名前と年齢が正しく表示される', () => {
        render(<User {...defaultProps} />);
        
        // 名前の確認
        expect(screen.getByText("山田太郎")).toBeInTheDocument();
        
        // 年齢の確認
        expect(screen.getByText("年齢: 30歳")).toBeInTheDocument();
    });

    test('異なるプロパティでも正しく表示される', () => {
        const newProps: UserProps = {
            name: "鈴木花子",
            age: 25
        };
        
        render(<User {...newProps} />);
        
        expect(screen.getByText("鈴木花子")).toBeInTheDocument();
        expect(screen.getByText("年齢: 25歳")).toBeInTheDocument();
    });
});
