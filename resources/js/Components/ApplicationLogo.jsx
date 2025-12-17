export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            {...props}
            className={`object-contain ${className}`}
            src="/logo-smk-batik-perbaik-purworejo.png"
            alt="Logo SMK Batik Perbaik Purworejo"
        />
    );
}
