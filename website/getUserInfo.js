// Function to fetch user information from the server
async function getUserInfo(token) {
    try {
        const response = await fetch('/users/me', {
            method: 'GET',
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch user information');
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}
