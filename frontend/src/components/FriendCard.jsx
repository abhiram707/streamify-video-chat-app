import { Link } from "react-router-dom";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img
              src={friend.profilePic || "/default-avatar.png"}
              alt={`${friend.fullName} profile picture`}
              className="rounded-full"
            />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        {/* LANGUAGES */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {friend.nativeLanguage && (
            <span className="badge badge-secondary text-xs flex items-center gap-1">
              {getLanguageFlag(friend.nativeLanguage)}
              Native: {friend.nativeLanguage}
            </span>
          )}
          {friend.learningLanguage && (
            <span className="badge badge-outline text-xs flex items-center gap-1">
              {getLanguageFlag(friend.learningLanguage)}
              Learning: {friend.learningLanguage}
            </span>
          )}
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-4 inline-block"
      />
    );
  }
  return null;
}
