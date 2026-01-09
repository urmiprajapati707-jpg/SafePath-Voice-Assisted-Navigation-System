
import { Contact } from "../types";

export class StorageService {
  private static CONTACTS_KEY = 'smart_nav_contacts';

  static getContacts(): Contact[] {
    const data = localStorage.getItem(this.CONTACTS_KEY);
    return data ? JSON.parse(data) : [
      { name: "Emergency Dispatch", phone: "911" },
      { name: "Guardian", phone: "555-0199" }
    ];
  }

  static saveContact(contact: Contact) {
    const contacts = this.getContacts();
    contacts.push(contact);
    localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
  }
}
