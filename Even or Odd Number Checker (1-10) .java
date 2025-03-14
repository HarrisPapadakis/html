package elearning;

import javax.swing.JOptionPane;

public class Switch2 {

    public static void main(String[] args) {
        try {
            // Prompt the user to enter an integer between 1 and 10
            int x = Integer.parseInt(JOptionPane.showInputDialog("Enter an integer from 1 to 10:"));

            String message;
            switch (x) {
                case 2, 4, 6, 8, 10 -> message = "The number " + x + " is even.";
                case 1, 3, 5, 7, 9 -> message = "The number " + x + " is odd.";
                default -> message = "Invalid input! Please enter a number between 1 and 10.";
            }

            // Display the result in a message dialog
            JOptionPane.showMessageDialog(null, message);
        } catch (NumberFormatException e) {
            // Handle cases where the input is not a valid integer
            JOptionPane.showMessageDialog(null, "Error! Please enter a valid integer.", "Input Error", JOptionPane.ERROR_MESSAGE);
        }

        // Exit the program
        System.exit(0);
    }
}
