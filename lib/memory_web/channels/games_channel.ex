defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = Memory.BackupAgent.get(name) || Memory.Game.new()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      Memory.BackupAgent.put(name, game)
      {:ok, %{"game" => Memory.Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("guess", %{"ind" => ind}, socket) do
    name = socket.assigns[:name]
    game = Memory.Game.nextState(ind, socket.assigns[:game])
    socket = assign(socket, :game, game)
    Memory.BackupAgent.put(name, game)
    {:reply, {:ok, %{"game" => Memory.Game.client_view(game)}}, socket}
  end

  def handle_in("reset", %{}, socket) do
    name = socket.assigns[:name]
    game = Memory.Game.reset(socket.assigns[:game])
    socket = assign(socket, :game, game)
    Memory.BackupAgent.put(name, game)
    {:reply, {:ok, %{"game" => Memory.Game.client_view(game)}}, socket}
  end

  def handle_in("restart", %{}, socket) do
    name = socket.assigns[:name]
    game = Memory.Game.new()
    socket = assign(socket, :game, game)
    Memory.BackupAgent.put(name, game)
    {:reply, {:ok, %{"game" => Memory.Game.client_view(game)}}, socket}
  end


  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
