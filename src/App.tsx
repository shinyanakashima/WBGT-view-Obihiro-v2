import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";

export default function App() {
	return (
		<BrowserRouter basename='/WBGT-view-Obihiro-v2'>
			<Routes>
				<Route path='/:city' element={<MainPage />} />
			</Routes>
		</BrowserRouter>
	);
}
