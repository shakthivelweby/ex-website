import Image from "next/image";

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          About Us
        </h1>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our Story
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome to our modern Next.js website! We're passionate about
              creating beautiful, performant web applications using the latest
              technologies.
            </p>
            <p className="text-gray-600">
              Our team specializes in building scalable web solutions that
              provide exceptional user experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600">
                To create innovative web solutions that help businesses grow and
                succeed in the digital world.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600">
                To be at the forefront of web development, pushing the
                boundaries of what's possible with modern technologies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
