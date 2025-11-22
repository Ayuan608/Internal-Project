import { createContext, useContext, useState } from 'react';

const TextSizeContext = createContext();

export const TextSizeProvider = ({ children }) => {
    const [textSize, setTextSize] = useState(14);
    return (
        <TextSizeContext.Provider  value={{ textSize, setTextSize }}>
            {children}
        </TextSizeContext.Provider>
    );
};

export const useTextSize = () => useContext(TextSizeContext);
