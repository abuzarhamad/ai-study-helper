
interface ProfileCardUser {
  name: string;
  email: string;
  username?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  headline?: string;
  phone?: string;
  website?: string;
  location?: { city?: string; country?: string };
  gender?: string;
  dateOfBirth?: string | Date | null;
  skills?: string[];
  interests?: string[];
  socialLinks?: Record<string, string>;
}

export default function ProfileCard({ user }: { user: ProfileCardUser }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">

      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="px-6 pb-8">

        {/* Profile Image */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 relative">
          <img
            src={user.profileImage || "/default-avatar.png"}
            alt={user.name}
            className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 object-cover bg-gray-200"
          />

          <div className="pb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-gray-500">
              @{user.username || "username"}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            About
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {user.bio || "No bio added yet."}
          </p>
        </div>

        {/* Headline */}
        {user.headline && (
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {user.headline}
          </p>
        )}

        {/* Personal Details */}
        <div className="grid sm:grid-cols-2 gap-5 mt-8">

          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.phone} />
          <Info label="Website" value={user.website} />
          <Info
            label="Location"
            value={`${user.location?.city || ""} ${user.location?.country || ""}`.trim()}
          />

          <Info
            label="Gender"
            value={user.gender}
          />

          <Info
            label="Date of Birth"
            value={
              user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString()
                : ""
            }
          />
        </div>

        {/* Skills */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {user.skills?.length ? (
              user.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No skills added.
              </p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Interests
          </h3>

          <div className="flex flex-wrap gap-2">
            {user.interests?.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Social Profiles
          </h3>

          <div className="flex flex-wrap gap-4">
            {Object.entries(user.socialLinks || {}).map(
              ([name, url]) =>
                url && (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="capitalize text-blue-600 hover:underline"
                  >
                    {name}
                  </a>
                )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
        {value || "Not provided"}
      </p>
    </div>
  );
}
