import { Icon } from "@iconify/react";
import { ActivityItem } from "./page";

export default function FormDepense({
  activityFeed,
}: {
  activityFeed: ActivityItem[];
}) {
  return (
    <div className="col-span-12 xl:col-span-4 bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-darkborder">
        <h4 className="text-midnight_text dark:text-white">Activité récente</h4>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-darkborder">
        {activityFeed.map((item) => (
          <li key={item.id} className="flex items-start gap-4 px-6 py-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.color}`}
            >
              <Icon icon={item.icon} className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-midnight_text dark:text-white leading-snug">
                {item.text}
              </p>
              <p className="text-xs text-dark/40 dark:text-white/30 mt-0.5">
                {item.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
