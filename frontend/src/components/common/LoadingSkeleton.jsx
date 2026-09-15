export function LoadingSkeleton({ count = 1 }) {
    return (<div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (<div key={i} className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>))}
    </div>);
}
