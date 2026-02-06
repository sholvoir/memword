import type { JSX } from "solid-js";

export default (props: JSX.HTMLAttributes<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" {...props}>
        <title>Loading</title>
		<g>
			<circle cx="16" cy="64" r="16" fill="#000000" />
			<circle
				cx="16"
				cy="64"
				r="16"
				fill="#555555"
				transform="rotate(45,64,64)"
			/>
			<circle
				cx="16"
				cy="64"
				r="16"
				fill="#949494"
				transform="rotate(90,64,64)"
			/>
			<circle
				cx="16"
				cy="64"
				r="16"
				fill="#cccccc"
				transform="rotate(135,64,64)"
			/>
			<circle
				cx="16"
				cy="64"
				r="16"
				fill="#e1e1e1"
				transform="rotate(180,64,64)"
			/>
			<circle
				cx="16"
				cy="64"
				r="16"
				fill="#e1e1e1"
				transform="rotate(225,64,64)"
			/>
			<circle
				cx="16"
				cy="64"
				r="16"
				fill="#e1e1e1"
				transform="rotate(270,64,64)"
			/>
			<circle
				cx="16"
				cy="64"
				r="16"
				fill="#e1e1e1"
				transform="rotate(315,64,64)"
			/>
			<animateTransform
				attributeName="transform"
				type="rotate"
				values="45 64 64;90 64 64;135 64 64;180 64 64;225 64 64;270 64 64;315 64 64;0 64 64;"
				calcMode="discrete"
				dur="720ms"
				repeatCount="indefinite"
			></animateTransform>
		</g>
	</svg>
);
