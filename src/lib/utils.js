export const formatMessageTime = (date) => {
    if (!date) return "";   
    const parsed = new Date(date);
    if (isNaN(parsed)) return ""; //
    return parsed.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    })
}
