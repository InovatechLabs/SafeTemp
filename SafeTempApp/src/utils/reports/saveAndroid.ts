import * as FileSystem from 'expo-file-system/legacy'; 
const { StorageAccessFramework } = FileSystem;
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const salvarAndroid = async (
  fileUri: string, 
  fileName: string, 
  mimeType: string, 
  encoding: FileSystem.EncodingType 
) => {
  try {

    const savedDirUri = await SecureStore.getItemAsync('user_selected_folder');

    if (savedDirUri) {
      try {
        const newFileUri = await StorageAccessFramework.createFileAsync(savedDirUri, fileName, mimeType);
        
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: encoding 
        });

        await FileSystem.writeAsStringAsync(newFileUri, fileContent, {
          encoding: encoding
        });

        Alert.alert("Sucesso", "Arquivo salvo na sua pasta padrão!");
        return; 

      } catch (e) {

        console.log("Permissão antiga inválida, pedindo nova...");
      }
    }

    Alert.alert(
      "Configuração Inicial",
      "Para salvar arquivos, o Android exige que você escolha ou crie uma pasta segura. Isso só será necessário uma vez."
    );

    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(
      "content://com.android.externalstorage.documents/tree/primary%3ADownload"
    );

    if (permissions.granted) {
      const directoryUri = permissions.directoryUri;

      await SecureStore.setItem('user_selected_folder', directoryUri);

      // Cria e Salva o arquivo
      const newFileUri = await StorageAccessFramework.createFileAsync(directoryUri, fileName, mimeType);
      
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8 
      });

      await FileSystem.writeAsStringAsync(newFileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8 
      });

      Alert.alert("Configurado!", "Pasta salva. Os próximos downloads serão automáticos.");
    }

  } catch (e) {
    console.error(e);
    Alert.alert("Erro", "Falha ao salvar arquivo.");
  }
};