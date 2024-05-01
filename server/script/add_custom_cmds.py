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
        "--description", type=str, required=True, help="Description of the update"
    )
    parser.add_argument(
        "--secret_path", type=str, required=True, help="Path to the secret file"
    )
    parser.add_argument(
        "--args", type=str, required=True, help="Description of the arg"
    )
    parser.add_argument(
        "--set",
        type=str,
        required=True,
        help="set of the type for channel supporting this command",
    )
    args = parser.parse_args()

    load_dotenv(args.secret_path)

    api_key = os.getenv("CHAT_API_KEY")
    api_secret = os.getenv("REACT_APP_API_SECRET")

    if not api_key or not api_secret:
        raise ValueError("API key or API secret not found in the env")

    server_client = StreamChat(api_key=api_key, api_secret=api_secret)

    server_client.create_command(
        dict(
            name=args.name,
            description=args.description,
            args=args.args,
            set=args.set,
        )
    )

    print("Successfully Created command: /" + args.name)

    channel = server_client.channel("messaging", "ui")
    channel.update_partial({"config_overrides": {"commands": [args.name]}})

    server_client.update_app_settings(
        custom_action_handler_url="https://cosmic-excited-mustang.ngrok-free.app/update"
    )
    print("updated the custom url")

    print("Here's the full command list: ")
    print(server_client.list_commands())


if __name__ == "__main__":
    main()
