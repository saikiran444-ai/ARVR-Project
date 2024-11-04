import { useStore } from '../hooks/useStore'; // Import the state management hook
import { Cube } from './Cube'; // Use curly braces for named export

export const Cubes = () => {
    const [cubes] = useStore((state) => [state.cubes]);
    return cubes.map(({ key, pos, texture }) => (
        <Cube key={key} position={pos} texture={texture} />
    ));
};
