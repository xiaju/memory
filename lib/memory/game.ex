defmodule Memory.Game do
  def new do
    %{
      tileState: Enum.shuffle(initState()),
      matches: 0,
      lastClicked: [],
      clicks: 0,
    }
  end

  def client_view(game) do
    %{
      matches: game[:matches],
      clicks: game[:clicks],
      tileState: Enum.map(game[:tileState], fn(x) -> x[:msg] end),
    }
  end

  def initState() do
    List.foldl(["a", "b", "c", "d", "e", "f", "g", "h"], [], fn x, a -> I
      n = %{letter: x, clicked: &noClick/2, msg: "blocked"}
      a ++ [n] ++ [n]
    end)
  end

  def nextState(ind, game)  do
    Enum.at(game[:tileState], ind)[:clicked].(ind, game)
  end

  def noClick(ind, game) do
    y = Enum.at(game[:tileState], ind)
    a = List.foldl(game[:tileState], [], fn x, a ->
      if x[:msg] != "finished" do
        n = %{letter: x[:letter], clicked: &delay/2, msg: x[:msg]}
        a ++ [n]
      else
        a ++ [x]
      end
    end)
    a = List.replace_at(a, ind, %{
      letter: y[:letter],
      clicked: &nothingClicked/2,
      msg: y[:letter],
    })
    %{
      tileState: a,
      matches: game[:matches],
      lastClicked: game[:lastClicked] ++ [ind],
      clicks: game[:clicks] + 1,
    }
  end

  def nothingRevealed(_ind, game) do
    game
  end

  def nothingClicked(_ind, game) do
    game
  end

  def delay(ind, game) do
    a = List.foldl(game[:tileState], [], fn x, a ->
      if x[:msg] != "finished" do
        n = %{letter: x[:letter], clicked: &nothingClicked/2, msg: x[:msg]}
        a ++ [n]
      else
        a ++ [x]
      end
    end)

    a = List.replace_at(a, ind, %{letter: Enum.at(a, ind)[:letter], clicked: &nothingClicked/2, msg: Enum.at(a, ind)[:letter]})
    %{
      tileState: a,
      matches: game[:matches],
      lastClicked: game[:lastClicked] ++ [ind],
      clicks: game[:clicks] + 1,
    }
  end

  def reset(game) do
    a = List.foldl(game[:tileState], [], fn x, a ->
      if x[:msg] != "finished" do
        n = %{letter: x[:letter], clicked: &noClick/2, msg: x[:msg]}
        a ++ [n]
      else 
        a ++ [x]
      end
    end)
    i1 = Enum.at(game[:lastClicked], 0)
    i2 = Enum.at(game[:lastClicked], 1)
    t1 = Enum.at(a, i1)
    t2 = Enum.at(a, i2)
    matches = t1[:letter] == t2[:letter]
    a = if matches do
      a = List.replace_at(a, i1, %{letter: t1[:letter], clicked: &nothingRevealed/2, msg: "finished"})
      List.replace_at(a, i2, %{letter: t2[:letter], clicked: &nothingRevealed/2, msg: "finished"})
    else
      a = List.replace_at(a, i1, %{letter: t1[:letter], clicked: &noClick/2, msg: "blocked"})
      List.replace_at(a, i2, %{letter: t2[:letter], clicked: &noClick/2, msg: "blocked"})
    end

    addMatches = if matches, do: 1, else: 0

    %{
      tileState: a,
      matches: game[:matches] + addMatches,
      lastClicked: [],
      clicks: game[:clicks],
    }
  end
end
