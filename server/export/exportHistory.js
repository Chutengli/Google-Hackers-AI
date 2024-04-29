import { StreamChat } from 'stream-chat';  // Import StreamChat from stream-chat library

// Initialize the server client with your API key and secret
const serverClient = StreamChat.getInstance(process.env.CHAT_API_KEY, process.env.REACT_APP_API_SECRET);

async function exportChannel(channelType, channelId, startDate, endDate) {
    // Request an export of the channel
    const exportResponse = await serverClient.exportChannel({
        type: channelType,
        id: channelId,
        messages_since: startDate,
        messages_until: endDate,
    }, {
        version: "v2"  // Using the new version for line-separated JSON if needed
    });

    const taskID = exportResponse.task_id;  // Save the task ID to track the export status
    console.log(`Export requested. Task ID: ${taskID}`);
    return taskID;
}

async function checkExportStatus(taskId, intervalId) {
    // Retrieve the status of the export
    const statusResponse = await serverClient.getExportChannelStatus(taskId);
    console.log(`Export status: ${statusResponse.status}`);

    if (statusResponse.status === 'completed' || statusResponse.error) {
        clearInterval(intervalId);  // Clear the interval once the export is completed or in case of an error
        if (statusResponse.status === 'completed') {
            console.log(`Download URL: ${statusResponse.result.url}`);
        } else if (statusResponse.error) {
            console.error(`Export error: ${statusResponse.error}`);
        }
    }
}

// Usage example
async function main() {
    const channelType = 'messaging';  // Type of the channel
    const channelId = 'ui';  // ID of the channel you want to export
    const startDate = '2024-04-29T00:00:00.000Z';  // Start date for the message export
    const endDate = '2024-04-30T00:00:00.000Z';  // End date for the message export

    try {
        const taskId = await exportChannel(channelType, channelId, startDate, endDate);
        // Periodically check the status every 10 seconds
        var intervalId = setInterval(() => checkExportStatus(taskId, intervalId), 5000);
    } catch (error) {
        console.error('Failed to export messages:', error);
    }
}

main();