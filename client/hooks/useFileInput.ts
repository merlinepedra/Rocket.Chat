// @ts-nocheck
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRef, useEffect } from 'react';

export const useFileInput = (
	onSetFile,
	fileType = 'image/*',
	fileField = 'image',
): [unknown, unknown] => {
	const ref = useRef();

	useEffect(() => {
		const fileInput = document.createElement('input');
		fileInput.setAttribute('type', 'file');
		fileInput.setAttribute('style', 'display: none');
		document.body.appendChild(fileInput);
		ref.current = fileInput;

		return (): void => {
			ref.current = null;
			fileInput.remove();
		};
	}, []);

	useEffect(() => {
		const fileInput = ref.current;
		if (!fileInput) {
			return;
		}

		fileInput.setAttribute('accept', fileType);
	}, [fileType]);

	useEffect(() => {
		const fileInput = ref.current;
		if (!fileInput) {
			return;
		}

		const handleFiles = (): void => {
			const formData = new FormData();
			formData.append(fileField, fileInput.files[0]);
			onSetFile(fileInput.files[0], formData);
		};

		fileInput.addEventListener('change', handleFiles, false);

		return (): void => {
			fileInput.removeEventListener('change', handleFiles, false);
		};
	}, [fileField, fileType, onSetFile]);

	const onClick = useMutableCallback(() => ref.current.click());
	const reset = useMutableCallback(() => {
		ref.current.value = '';
	});
	return [onClick, reset];
};
