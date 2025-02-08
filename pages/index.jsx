import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Resume Builder</h1>
      <p className="text-lg text-gray-700 mb-4">Create a professional resume in minutes!</p>
      <Link href="/builder">
        <button className="px-6 py-3 bg-fuchsia-700 text-white rounded-lg text-xl font-medium hover:bg-fuchsia-800 transition">
          Start Building
        </button>
      </Link>
    </div>
  );
}
