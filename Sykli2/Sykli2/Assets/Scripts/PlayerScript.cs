using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class PlayerScript : MonoBehaviour
{
    public float speed;
    public int points;

    private Gyroscope gyro;
    private Vector3 gyroRotationEuler;
    private float defaultZRotation;

    void Start()
    {
        // Otetaan gyroskooppi k‰yttˆˆn
        gyro = Input.gyro;
        gyro.enabled = true;
        // Otetaan talteen laitteen rotaatio alussa niin voidaan siihen suhteessa k‰‰nt‰‰ pelaajaa
        // T‰‰ kannattas k‰yttˆkokemuksen kannalta tehd‰ varmaan jotenkin toisin kyll‰kin
        defaultZRotation = gyro.attitude.eulerAngles.z;
    }

    private void Update()
    {
        //K‰‰nnet‰‰n pelaaja puhelimen suunnan mukaisesti ja liikutetaan alasp‰in
        gyroRotationEuler = gyro.attitude.eulerAngles;
        transform.eulerAngles = new Vector3(0, 0, -gyroRotationEuler.z + defaultZRotation);
        transform.position -= transform.up * speed * Time.deltaTime;
    }

    // Aloittaa pelin uudestaan pelaajan kuoltua
    public void Die()
    {
        Scene scene = SceneManager.GetActiveScene();
        SceneManager.LoadScene(scene.name);
    }
}
