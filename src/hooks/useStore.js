import create from 'zustand';
import { nanoid } from 'nanoid';

const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key));
const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value));

export const useStore = create((set) => ({
	texture: 'dirt',
	cubes: getLocalStorage('cubes') || [],
	addCube: (x, y, z) => {
		set((prev) => {
			const newCubes = [
				...prev.cubes,
				{
					key: nanoid(),
					pos: [x, y, z],
					texture: prev.texture
				}
			];
			setLocalStorage('cubes', newCubes); // Update local storage when adding a cube
			return { cubes: newCubes };
		});
	},
	removeCube: (x, y, z) => {
		set((prev) => {
			const newCubes = prev.cubes.filter(cube => {
				const [X, Y, Z] = cube.pos;
				return X !== x || Y !== y || Z !== z;
			});
			setLocalStorage('cubes', newCubes); // Update local storage when removing a cube
			return { cubes: newCubes };
		});
	},
	setTexture: (texture) => {
		set(() => ({ texture }));
	},
	saveWorld: () => {
		set((prev) => {
			setLocalStorage('cubes', prev.cubes); // Ensure current cubes are saved
		});
	},
	resetWorld: () => {
		set(() => {
			localStorage.removeItem('cubes'); // Clear local storage when resetting the world
			return { cubes: [] }; // Reset cubes state
		});
	},
}));
