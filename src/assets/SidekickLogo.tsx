import "@assets/svg.css";

const SidekickLogo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className="svg-icon"
      fill="none"
    >
      <rect width="32" height="32" fill="none" />
      <path
        d="M4.15,19.7c0,0,4.18-5.66,6.45-8.74c2.77-3.78,6.96-2.73,7.76-0.06c0.32,1.07,0.07,2.41,0.07,2.41
          s3.83-5.24,5.24-7.11c2.96-3.93,8.35-2.14,7.26,1.97c-0.77,2.9-2.8,9.67-4.37,14.63c-1.64,5.18-7.78,4.29-6.43-0.22
          c1.45-4.85,2.2-7.25,2.2-7.25s-3.97,6.08-6.67,7.05c-3.53,1.27-2.19-4.31-2.19-4.31s-4.03,5.46-5.63,7.67
          c-3.3,4.54-8.66,1.52-6.33-2.43"
        stroke={"var(--primary-orange)"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
      />
    </svg>
  );
};

export default SidekickLogo;
