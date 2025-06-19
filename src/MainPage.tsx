import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import qrEnvWBGT from "./assets/QR_env_wbgt.png";

export default function MainPage() {
	const { city = "obihiro" } = useParams();

	const CITY_LABELS: Record<string, string> = {
		obihiro: "帯広",
		sapporo: "札幌",
	};

	const [bgcolor, setBgColor] = useState("#ffffff");
	const [maxKey, setMaxKey] = useState<string | null>(null);
	const [maxValue, setMaxValue] = useState<number | null>(null);
	const [month, setMonth] = useState<number | null>(null);
	const [day, setDay] = useState<number | null>(null);
	const [wgbtLevel, setWgbtLevel] = useState("Loading...");

	const API_URL = `https://6ealbffjxfgzo4r3kuiac7txry0bnwbm.lambda-url.us-east-1.on.aws/?chiten=${city}`;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const resp = await axios.get(API_URL);
				const dateKey = new Date()
					.toLocaleDateString("ja-JP", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					})
					.replaceAll("/", "");

				const todayData = resp.data[dateKey];
				if (!todayData) return;

				const monthNum = parseInt(dateKey.slice(4, 6), 10);
				const dayNum = parseInt(dateKey.slice(6, 8), 10);
				setMonth(monthNum);
				setDay(dayNum);

				const { maxKey, maxValue } = Object.entries(todayData).reduce<{
					maxKey: string | null;
					maxValue: number;
				}>(
					(acc, [key, value]) => {
						const num = typeof value === "number" ? value : parseFloat(String(value));
						if (num > acc.maxValue) {
							return { maxKey: key, maxValue: num };
						}
						return acc;
					},
					{ maxKey: null, maxValue: -Infinity }
				);

				setMaxKey(maxKey);
				setMaxValue(maxValue);

				if (maxValue >= 31) {
					setBgColor("#ff2800");
					setWgbtLevel("危険");
				} else if (maxValue >= 28) {
					setBgColor("#ff9600");
					setWgbtLevel("厳重警戒");
				} else if (maxValue >= 25) {
					setBgColor("#faf500");
					setWgbtLevel("警戒");
				} else if (maxValue >= 21) {
					setBgColor("#a0d2ff");
					setWgbtLevel("注意");
				} else {
					setBgColor("#218cff");
					setWgbtLevel("ほぼ安全");
				}
			} catch (err) {
				console.error("Error fetching WBGT data:", err);
			}
		};

		fetchData();
		const timerId = setInterval(fetchData, 60000);
		return () => clearInterval(timerId);
	}, [API_URL]);

	return (
		<div
			className='flex flex-col items-center justify-center text-center min-h-screen'
			style={{ backgroundColor: bgcolor }}>
			<header className='pt-4 text-6xl'>
				<section>今日の熱中症危険度 @{CITY_LABELS[city] ?? "不明な地域"}</section>
			</header>
			<main>
				{maxValue !== null && maxKey !== null && (
					<section>
						<div className='text-[calc(10px+30vmin)] font-bold'>{wgbtLevel}</div>
						<div className='flex justify-center mt-6'>
							<div className='text-4xl'>
								{month}/{day} {maxKey}時頃にWBGT {maxValue}℃となる見込みです
							</div>
						</div>
						<div className='flex items-center space-x-4 mt-6'>
							<p className='text-2xl text-red-600'>
								※WBGTは気温よりも低い数値で表示されます。
							</p>
							<p>QRコードから環境省サイトで確認できます。</p>
							<img src={qrEnvWBGT} className='w-24 h-24' alt='Env QR Code' />
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
