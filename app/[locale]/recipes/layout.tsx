export default function IngredientsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col justify-center gap-4">
            <div className="inline-block justify-center px-2">{children}</div>
        </section>
    );
}
