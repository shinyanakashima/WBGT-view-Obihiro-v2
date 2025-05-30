import { useState, useEffect } from "react";
import axios from "axios";
import qrEnvWBGT from "./assets/QR_env_wbgt.png";

function App() {
	const [bgcolor, setBgColor] = useState("#ffffff");
	const [maxKey, setMaxKey] = useState<string | null>(null);
	const [maxValue, setMaxValue] = useState<number | null>(null);
	const [month, setMonth] = useState<number | null>(null);
	const [day, setDay] = useState<number | null>(null);
	const [wgbtLevel, setWgbtLevel] = useState("Loading...");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const resp = await axios.get(
					"https://6ealbffjxfgzo4r3kuiac7txry0bnwbm.lambda-url.us-east-1.on.aws/"
				);

				const dateKey = new Date()
					.toLocaleDateString("ja-JP", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					})
					.replaceAll("/", "");

				const todayData = resp.data[dateKey];
				const month = dateKey.substring(4, 6);
				const day = dateKey.substring(6, 8);
				const monthNum = parseInt(month, 10);
				const dayNum = parseInt(day, 10);
				setMonth(monthNum);
				setDay(dayNum);
				if (!todayData) return;

				const { maxKey, maxValue } = Object.entries(todayData).reduce(
					(acc: { maxKey: string | null; maxValue: number }, [key, value]) => {
						if (typeof value === "number" && value > acc.maxValue) {
							return { maxKey: key, maxValue: value };
						}
						return acc;
					},
					{ maxKey: null, maxValue: -Infinity }
				);

				setMaxKey(maxKey);
				setMaxValue(maxValue);

				if (maxValue >= 31) {
					setBgColor("#ff2800"); // 赤
					setWgbtLevel("危険");
				} else if (maxValue >= 28) {
					setBgColor("#ff9600"); // 橙
					setWgbtLevel("厳重警戒");
				} else if (maxValue >= 25) {
					setBgColor("#faf500"); // 黄
					setWgbtLevel("警戒");
				} else if (maxValue >= 21) {
					setBgColor("#a0d2ff"); // 水色
					setWgbtLevel("注意");
				} else {
					setBgColor("#218cff"); // 青
					setWgbtLevel("ほぼ安全");
				}
			} catch (err) {
				console.error("Error fetching data:", err);
			}
		};

		fetchData();
		const timerId = setInterval(fetchData, 60000);
		return () => clearInterval(timerId);
	}, []);

	return (
		<div className='text-center min-h-screen' style={{ backgroundColor: bgcolor }}>
			<header className='pt-4 text-6xl'>
				<section>今日の最高暑さ指数@帯広</section>
			</header>
			<main className='flex flex-col items-center justify-center pt-20'>
				{maxValue !== null && maxKey !== null && (
					<section>
						<div className='mb-2 text-8xl'>
							{month}/{day} {maxKey}時頃に
						</div>
						<div className='text-[calc(10px+25vmin)] font-bold'>
							{wgbtLevel} ({maxValue}℃)
						</div>
						<div className='flex items-center space-x-4'>
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

export default App;
