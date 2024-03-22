export function capitalize(str: string) {
    // Split the string into an array of words
    let words = str.split(" ");

    // Iterate through the array of words
    for (let i = 0; i < words.length; i++) {
        // Capitalize the first letter of each word
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }

    // Join the words back into a single string
    return words.join(" ");
}
