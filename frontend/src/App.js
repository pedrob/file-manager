import React, { useState, useEffect } from 'react';
import { uniqueId } from 'lodash';
import filesize from 'filesize';

import api from './services/api';

import GlobalStyle from './styles/global';
import { Container, Content } from './styles';

import Upload from './components/Upload';
import FileList from './components/FileList';

function App() {
	const [ uploadedFiles, setUploadedFiles ] = useState([]);

	useEffect(() => {
		async function loadFiles() {
			const response = await api.get('posts/');
			setUploadedFiles(
				response.data.map((file) => ({
					id: file._id,
					name: file.name,
					readableSize: filesize(file.size),
					preview: file.url,
					uploaded: true,
					url: file.url
				}))
			);
		}
		loadFiles();
		return () => {
			setUploadedFiles((prev) =>
				prev.forEach((file) => URL.revokeObjectURL(file.preview))
			);
		};
	}, []);

	function updateFile(id, data) {
		setUploadedFiles((prevUploadedFiles) =>
			prevUploadedFiles.map((uploadedFile) => {
				return uploadedFile.id === id
					? { ...uploadedFile, ...data }
					: uploadedFile;
			})
		);
	}

	function handleUpload(files) {
		const newUploadedFiles = files.map((file) => ({
			file,
			id: uniqueId(),
			name: file.name,
			readableSize: filesize(file.size),
			preview: URL.createObjectURL(file),
			progress: 0,
			uploaded: false,
			error: false,
			url: null
		}));
		setUploadedFiles([ ...uploadedFiles, ...newUploadedFiles ]);
		newUploadedFiles.forEach(processUpload);
	}

	function processUpload(uploadedFile) {
		const data = new FormData();
		data.append('file', uploadedFile.file, uploadedFile.name);

		api
			.post('posts', data, {
				onUploadProgress: (e) => {
					const progress = parseInt(
						Math.round(e.loaded * 100 / e.total)
					);
					updateFile(uploadedFile.id, {
						progress
					});
				}
			})
			.then((res) => {
				updateFile(uploadedFile.id, {
					uploaded: true,
					id: res.data._id,
					url: res.data.url
				});
			})
			.catch(() => {
				updateFile(uploadedFile.id, {
					error: true
				});
			});
	}

	async function handleDelete(id) {
		await api.delete(`posts/${id}`);
		setUploadedFiles(
			uploadedFiles.filter((uploadedFile) => uploadedFile.id !== id)
		);
	}

	return (
		<Container>
			<Content>
				<Upload onUpload={handleUpload} />
				{!!uploadedFiles.length && (
					<FileList files={uploadedFiles} onDelete={handleDelete} />
				)}
			</Content>
			<GlobalStyle />
		</Container>
	);
}

export default App;
