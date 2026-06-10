import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

// Se testar pelo celular físico, troque localhost pelo IP do seu computador.
// Exemplo: http://192.168.0.10:3000/api/tasks
const API_URL = 'http://192.168.1.19:3000/api/tasks';

const priorities = ['baixa', 'média', 'alta'];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('média');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as tarefas. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Aviso', 'Digite o título da tarefa.');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.trim(),
      priority,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, taskData);
        Alert.alert('Sucesso', 'Tarefa atualizada!');
      } else {
        await axios.post(API_URL, taskData);
        Alert.alert('Sucesso', 'Tarefa cadastrada!');
      }

      clearForm();
      fetchTasks();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a tarefa.');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setDueDate(task.dueDate || '');
    setPriority(task.priority || 'média');
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/toggle`);
      fetchTasks();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status da tarefa.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmar exclusão', 'Deseja realmente excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/${id}`);
            fetchTasks();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
          }
        },
      },
    ]);
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('média');
    setEditingId(null);
  };

  const renderTask = ({ item }) => (
    <View style={[styles.card, item.completed && styles.completedCard]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, item.completed && styles.completedTitle]}>
          {item.title}
        </Text>
        <Text style={styles.priority}>{item.priority}</Text>
      </View>

      {!!item.description && <Text style={styles.description}>{item.description}</Text>}
      {!!item.dueDate && <Text style={styles.dueDate}>Prazo: {item.dueDate}</Text>}

      <Text style={styles.status}>
        Status: {item.completed ? 'Concluída' : 'Pendente'}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.doneButton} onPress={() => handleToggle(item.id)}>
          <Text style={styles.actionText}>{item.completed ? 'Reabrir' : 'Concluir'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>✅ Minhas Tarefas</Text>
        <Text style={styles.headerSubtitle}>Organize suas tarefas de forma simples</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Título da tarefa"
          placeholderTextColor="#777"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição"
          placeholderTextColor="#777"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Prazo, exemplo: 10/06/2026"
          placeholderTextColor="#777"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.priorityContainer}>
          {priorities.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.priorityButton, priority === item && styles.priorityButtonActive]}
              onPress={() => setPriority(item)}
            >
              <Text style={[styles.priorityButtonText, priority === item && styles.priorityButtonTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{editingId ? 'Atualizar' : 'Cadastrar'}</Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={clearForm}>
              <Text style={styles.saveButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          ListEmptyComponent={<Text style={styles.empty}>Nenhuma tarefa cadastrada.</Text>}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#dbeafe',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: '#f8fafc',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  label: {
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  priorityButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f8fafc',
  },
  priorityButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  priorityButtonText: {
    color: '#334155',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#64748b',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#2563eb',
    elevation: 2,
  },
  completedCard: {
    borderLeftColor: '#16a34a',
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginRight: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  priority: {
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  description: {
    color: '#475569',
    marginTop: 8,
    fontSize: 14,
  },
  dueDate: {
    color: '#334155',
    marginTop: 6,
    fontSize: 13,
  },
  status: {
    color: '#334155',
    marginTop: 6,
    fontSize: 13,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    marginRight: 7,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    marginRight: 7,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 20,
    fontSize: 16,
  },
});
