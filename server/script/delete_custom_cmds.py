from stream_chat import StreamChat
import os
import argparse
from dotenv import load_dotenv


def main():
    parser = argparse.ArgumentParser(description="Update a support ticket")
    parser.add_argument(
        "--name", type=str, required=True, help="Specify the name of the command"
    )
    parser.add_argument(
        "--secret_path", type=str, required=True, help="Path to the secret file"
    )

    args = parser.parse_args()

    load_dotenv(args.secret_path)

    api_key = os.getenv("CHAT_API_KEY")
    api_secret = os.getenv("REACT_APP_API_SECRET")

    if not api_key or not api_secret:
        raise ValueError("API key or API secret not found in the env")

    server_client = StreamChat(api_key=api_key, api_secret=api_secret)

    server_client.delete_command(args.name)

    print("Successfully Deleted command: /" + args.name)

    print("Here's the full command list: ")
    print(server_client.list_commands())


if __name__ == "__main__":
    main()
