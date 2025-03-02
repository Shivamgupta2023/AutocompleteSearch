import React, { useEffect, useRef, useState } from "react";

const AutocompleteSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mainList, setMainList] = useState([]);
  const [showList, setShowList] = useState(false);
  const [memoizeSearch, setMemoizeSearch] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const itemRefs = useRef([]); // Store refs for each list item

  const callGetRecipeApi = async () => {
    if (memoizeSearch[searchQuery]) {
      setMainList(memoizeSearch[searchQuery]);
      return;
    }
    try {
      const data = await fetch(
        `https://dummyjson.com/recipes/search?q=${searchQuery}`
      );
      const jsonData = await data.json();
      if (jsonData.recipes) {
        setMainList(jsonData.recipes);
        setMemoizeSearch((prev) => ({
          ...prev,
          [searchQuery]: jsonData?.recipes,
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // if (!searchQuery) return;
    let timer = setTimeout(() => callGetRecipeApi(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const onListClick = (name) => {
    console.log("name", name);
    setSearchQuery(name);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showList) return;
    switch (e.key) {
      case "ArrowDown":
        setHighlightedIndex((prevIndex) =>
          prevIndex < mainList.length - 1 ? prevIndex + 1 : 0
        );
        break;

      case "ArrowUp":
        setHighlightedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : mainList.length - 1
        );
        break;

      case "Enter":
        if (highlightedIndex >= 0) {
          onListClick(mainList[highlightedIndex].name);
        }
        break;

      default:
        break;
    }
  };

  return (
    <div className="container">
      Autocomplete Search
      <div className="main">
        <div className="input">
          <input
            className="searchBar"
            placeholder="Search item"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowList(true)}
            onBlur={() => setTimeout(() => setShowList(false), 300)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        {showList && (
          <div className="listContainer">
            {mainList.map((itm, index) => {
              return (
                <div
                  ref={(el) => (itemRefs.current[index] = el)}
                  className={`item ${
                    highlightedIndex === index ? "highlighted" : ""
                  }`}
                  key={itm.id}
                  onClick={() => onListClick(itm.name)}
                >
                  {itm.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutocompleteSearch;
