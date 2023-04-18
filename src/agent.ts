interface GetCompletionResponse {
    message: {
        role: string;
        content: string;
    };
}

class Agent {
    parseMove(response: GetCompletionResponse) {
        // given a response of the form "Move=up", return the direction

        // TODO: this is temporary solution
        const move = response.message.content.split('=')[1];
        return move;
    }

    async getNextMove() {
        try {
            const prompt = `
                You are an agent in a virtual 2D world. You can move in 4 directions: up, down, left, right.

                I am the system of that virtual 2D world.

                Please tell me what direction you want to move in. Return a response "Move=your_direction" where your_direction is the direction you want to move in.
            `;
            const response: GetCompletionResponse = await (window as any).ai.getCompletion({
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5,
            });

            console.log('getCompletion response:');
            console.log(response);
    
            return this.parseMove(response)
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}


export default Agent;