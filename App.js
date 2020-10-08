import React, { useState } from 'react';
import { StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("db.db");

function Items({ done: doneHeading, onPressItem}) {
  const [items, setItems] = React.useState([]);


React.useEffect(() => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM items where done = ?;`,
      [doneHeading ? 1:0],
      (_, { rows: { _array } }) => setItems(_array)
    );
    console.log(items);
  });
}, []);

const heading = doneHeading ? "Completed" : "To Do";

if(items === null || items.length === 0) {
  return null;
}

return(
  <View style = {styles.sectionContainer}>
    <Text style = {styles.sectionHeading}> {heading} </Text>
    {items.map(({ id, done, value }) => (
      <TouchableOpacity
        key = { id }
        onPress = {() => onPressItem && onPressItem(id)}
        style = {{
          backgroundColor: done ? "#629d62" : "#e2e2e2",
          borderColor: "#000",
          borderWidth: 1,
          padding: 8
        }}
      >
        <Text style = {{ color: done ? "#fff" : "#000" }}> {value} </Text>
      </TouchableOpacity>
    ))}
  </View>
);
      }

export default function App() {
  const [text, setText] = React.useState(null)
  const [forceUpdate, forceUpdateId] = useForceUpdate()

  React.useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        "CREATE table if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }, []);

  const add = (text) => {
    // is text empty?
    if(text === null || text === "") {
      return false;
    }

    db.transaction(
      tx => {
        tx.executeSql("INSERT into items (done, value) values (0, ?)", [text]);
        tx.executeSql("SELECT * from items", [], (_, {rows}) => 
        console.log(JSON.stringify(rows))
        );
      },
      null,
      forceUpdate
    );
  }

  return(
    <View style = {styles.container}>
      <Text style = {styles.heading}> React_SQLite App </Text>
      <View style = {styles.flexRow}>
        <TextInput
          onChangeText = {text => setText(text)}
          onSubmitEditing = {() => {
            add(text);
            setText(null);
          }}
          placeholder = "What do you need to do?"
          style = {styles.input}
          value = {text}
        />
      </View>
      <ScrollView style = {styles.listArea}>
        <Items
          key = {`forceupdate-todo-${forceUpdateId}`}
          done = {false}
          onPressItem = {id =>
            db.transaction(
              tx => {
                tx.executeSql(`UPDATE items set done = 1 where id = ?;`, [
                  id
                ]);
              },
              null,
              forceUpdate
            )
          }
        />
        <Items
          done
          key = {`forceupdate-done-${forceUpdateId}`}
          onPressItem = {id =>
            db.transaction(
              tx => {
                tx.executeSql(`DELETE items from items where id = ?;`, [id]);
              },
              null,
              forceUpdate
            )
          }
        />
      </ScrollView>
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Constants.statusBarHeight
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },

  flexRow: {
    flexDirection: "row"
  },

  input: {
    borderColor: "#4630eb",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8
  },

  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16
  },

  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16
  },

  sectionHeading: {
    fontSize: 18,
    marginBottom: 8
  }
});
