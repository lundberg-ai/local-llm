import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AipifyLocalPage from './components/pages/AipifyLocalPage';

export default function AppRouter() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<AipifyLocalPage />} />
			</Routes>
		</Router>
	);
}
